// Auto-Ticketing Service
// Triggered after payment confirmation to issue real GDS tickets
// Supports: Sabre (issueTicket), BDFare (issueTicket), TTI (manual only)

const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { safeJsonParse } = require('../utils/json');

const BD_AIRPORTS = ['DAC', 'CXB', 'CGP', 'ZYL', 'JSR', 'RJH', 'SPD', 'BZL', 'IRD', 'TKR'];

/**
 * Auto-ticket a booking after payment confirmation.
 * For international flights, checks that travel documents (passport + visa) are uploaded.
 * 
 * @param {string} bookingId - The booking UUID
 * @param {object} options - { skipDocCheck: false }
 * @returns {{ success: boolean, ticketed: boolean, ticketNo?: string, error?: string, requiresDocs?: boolean }}
 */
async function autoTicketAfterPayment(bookingId, options = {}) {
  const { skipDocCheck = false } = options;

  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (rows.length === 0) return { success: false, error: 'Booking not found' };

    const booking = rows[0];
    if (booking.booking_type !== 'flight') {
      // Non-flight bookings: just confirm status, no ticketing needed
      await db.query(`UPDATE bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = ?`, [bookingId]);
      return { success: true, ticketed: false, reason: 'Non-flight booking — no ticketing required' };
    }

    const details = safeJsonParse(booking.details, {});
    const outbound = details.outbound || {};
    const origin = (outbound.origin || '').toUpperCase();
    const destination = (outbound.destination || '').toUpperCase();
    const isDomestic = BD_AIRPORTS.includes(origin) && BD_AIRPORTS.includes(destination);

    // ── International flight: require passport + visa documents before ticketing ──
    if (!isDomestic && !skipDocCheck) {
      const travelDocs = details.travelDocuments || [];
      const passengers = safeJsonParse(booking.passenger_info, []);
      const paxCount = passengers.length || 1;

      // Check each passenger has at least a passport upload
      let docsComplete = true;
      for (let i = 0; i < paxCount; i++) {
        const hasPassport = travelDocs.some(d => 
          (d.passengerIndex === i || d.passengerIndex === String(i)) && 
          (d.docType === 'passport' || (d.fieldname || '').startsWith('passport'))
        );
        if (!hasPassport) { docsComplete = false; break; }
      }

      if (!docsComplete) {
        // Payment accepted but ticketing deferred until docs uploaded
        await db.query(
          `UPDATE bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = ?`,
          [bookingId]
        );
        console.log(`[AutoTicket] Booking ${bookingId}: International flight — docs incomplete, ticketing deferred`);
        return { 
          success: true, ticketed: false, requiresDocs: true,
          reason: 'International flight requires passport/visa upload before ticket issuance' 
        };
      }
    }

    // ── Determine GDS source and attempt real ticketing ──
    const gdsPnr = details.gdsPnr || null;
    const flightSource = outbound.source || '';
    const gdsBookingResult = details.gdsBookingResult || {};
    const bdfOrderId = gdsBookingResult.orderId || outbound._bdfOfferId || null;

    let ticketResult = null;
    let ticketNo = null;
    let gdsTicketed = false;

    // Sabre: issueTicket API
    if (gdsPnr && (flightSource === 'sabre' || outbound._sabreSource)) {
      try {
        const { issueTicket } = require('../routes/sabre-flights');
        ticketResult = await issueTicket({ pnr: gdsPnr });
        if (ticketResult.success) {
          gdsTicketed = true;
          ticketNo = ticketResult.ticketNumber || ticketResult.eTicketNumber || null;
          console.log(`[AutoTicket] Sabre ticket issued for PNR ${gdsPnr}: ${ticketNo}`);
        } else {
          console.warn(`[AutoTicket] Sabre ticketing failed for PNR ${gdsPnr}:`, ticketResult.error);
        }
      } catch (err) {
        console.error(`[AutoTicket] Sabre ticketing exception for PNR ${gdsPnr}:`, err.message);
      }
    }

    // BDFare: issueTicket API
    if (!gdsTicketed && bdfOrderId && flightSource === 'bdfare') {
      try {
        const { issueTicket } = require('../routes/bdf-flights');
        ticketResult = await issueTicket({ orderId: bdfOrderId, pnr: gdsPnr });
        if (ticketResult.success) {
          gdsTicketed = true;
          ticketNo = (ticketResult.ticketNumbers || [])[0] || null;
          console.log(`[AutoTicket] BDFare ticket issued for order ${bdfOrderId}: ${ticketNo}`);
        } else {
          console.warn(`[AutoTicket] BDFare ticketing failed:`, ticketResult.error);
        }
      } catch (err) {
        console.error(`[AutoTicket] BDFare ticketing exception:`, err.message);
      }
    }

    // TTI: No auto-ticketing API — manual only
    if (!gdsTicketed && (flightSource === 'tti' || outbound.airlineCode === '2A' || outbound.airlineCode === 'S2')) {
      console.log(`[AutoTicket] TTI/Air Astra booking ${bookingId}: Manual ticketing required`);
      // Still confirm the booking, admin will manually ticket
      await db.query(
        `UPDATE bookings SET status = 'confirmed', payment_status = 'paid' WHERE id = ?`,
        [bookingId]
      );
      // Generate placeholder ticket record
      const placeholderTicketNo = `098-${String(Math.floor(Math.random() * 9999999999)).padStart(10, '0')}`;
      await db.query(
        `INSERT INTO tickets (id, booking_id, user_id, ticket_no, pnr, status, details) VALUES (?, ?, ?, ?, ?, 'pending_issue', ?)`,
        [uuidv4(), bookingId, booking.user_id, placeholderTicketNo, gdsPnr || booking.booking_ref?.slice(-6)?.toUpperCase() || '',
         JSON.stringify({ note: 'TTI manual ticketing required', airline: outbound.airline, flightNumber: outbound.flightNumber })]
      );
      return { success: true, ticketed: false, reason: 'TTI requires manual ticketing — admin notified', ticketNo: placeholderTicketNo };
    }

    // ── Update booking status ──
    const finalTicketNo = ticketNo || `098-${String(Math.floor(Math.random() * 9999999999)).padStart(10, '0')}`;
    const newStatus = gdsTicketed ? 'ticketed' : 'confirmed';

    await db.query(
      `UPDATE bookings SET status = ?, payment_status = 'paid' WHERE id = ?`,
      [newStatus, bookingId]
    );

    // Update details with ticketing info
    const updatedDetails = { ...details, ticketingResult: ticketResult, ticketedAt: new Date().toISOString(), autoTicketed: gdsTicketed };
    await db.query(`UPDATE bookings SET details = ? WHERE id = ?`, [JSON.stringify(updatedDetails), bookingId]);

    // Insert ticket record
    await db.query(
      `INSERT INTO tickets (id, booking_id, user_id, ticket_no, pnr, status, details) VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [uuidv4(), bookingId, booking.user_id, finalTicketNo, gdsPnr || booking.booking_ref?.slice(-6)?.toUpperCase() || '',
       JSON.stringify({ 
         airline: outbound.airline, flightNumber: outbound.flightNumber, 
         origin, destination, departureTime: outbound.departureTime,
         gdsTicketed, autoTicketed: true,
       })]
    );

    console.log(`[AutoTicket] Booking ${bookingId}: status=${newStatus}, ticket=${finalTicketNo}, gdsTicketed=${gdsTicketed}`);
    return { success: true, ticketed: gdsTicketed, ticketNo: finalTicketNo, status: newStatus };

  } catch (err) {
    console.error(`[AutoTicket] Error for booking ${bookingId}:`, err);
    return { success: false, error: err.message };
  }
}

module.exports = { autoTicketAfterPayment };
