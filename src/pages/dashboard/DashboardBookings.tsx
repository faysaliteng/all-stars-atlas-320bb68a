import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Plane, Building2, Search, Eye, Download, MoreHorizontal, RotateCcw, XCircle,
  FileText, Globe, Palmtree, CreditCard, Timer, Clock, Luggage, Shield,
  ArrowRight, CircleDot, Users, AlertTriangle,
} from "lucide-react";
import { downloadCSV } from "@/lib/csv-export";
import { generateTicketPDF } from "@/lib/pdf-generator";
import { useDashboardBookings } from "@/hooks/useApiData";
import DataLoader from "@/components/DataLoader";
import { useToast } from "@/hooks/use-toast";
import PaymentReminderBanner from "@/components/PaymentReminder";


const statusTabs = ["All", "On Hold", "Pending", "In Progress", "Confirmed", "Completed", "Void", "Refund", "Exchange", "Expired", "Cancelled", "Un-Confirmed"];

const statusColors: Record<string, string> = {
  "Confirmed": "bg-success/10 text-success border-success/20",
  "confirmed": "bg-success/10 text-success border-success/20",
  "Pending": "bg-warning/10 text-warning border-warning/20",
  "pending": "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "in_progress": "bg-primary/10 text-primary border-primary/20",
  "Completed": "bg-muted text-muted-foreground border-border",
  "completed": "bg-muted text-muted-foreground border-border",
  "Cancelled": "bg-destructive/10 text-destructive border-destructive/20",
  "cancelled": "bg-destructive/10 text-destructive border-destructive/20",
  "Void": "bg-destructive/10 text-destructive border-destructive/20",
  "void": "bg-destructive/10 text-destructive border-destructive/20",
  "Refund": "bg-accent/10 text-accent border-accent/20",
  "refund": "bg-accent/10 text-accent border-accent/20",
  "Exchange": "bg-primary/10 text-primary border-primary/20",
  "exchange": "bg-primary/10 text-primary border-primary/20",
  "Expired": "bg-muted text-muted-foreground border-border",
  "expired": "bg-muted text-muted-foreground border-border",
  "On Hold": "bg-warning/10 text-warning border-warning/20",
  "on_hold": "bg-warning/10 text-warning border-warning/20",
  "Un-Confirmed": "bg-destructive/10 text-destructive border-destructive/20",
  "un_confirmed": "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcons: Record<string, typeof Plane> = { flight: Plane, hotel: Building2, visa: Globe, holiday: Palmtree };

/** Map raw API booking to display-friendly shape */
function mapBooking(b: any) {
  const details = b.details || {};
  const outbound = details.outbound || {};
  const passengers = b.passengerInfo || [];
  const origin = outbound.origin || details.origin || "";
  const destination = outbound.destination || details.destination || "";
  const airline = outbound.airline || details.airline || "";
  const airlineCode = outbound.airlineCode || details.airlineCode || "";
  const flightNumber = outbound.flightNumber || details.flightNumber || "";
  const cabinClass = outbound.cabinClass || details.cabinClass || "Economy";
  const aircraft = outbound.aircraft || outbound.legs?.[0]?.aircraft || "";
  const departureTime = outbound.departureTime || details.departureTime || "";
  const arrivalTime = outbound.arrivalTime || details.arrivalTime || "";
  const duration = outbound.duration || details.duration || "";
  const stops = outbound.stops ?? details.stops ?? 0;
  const baggage = outbound.baggage || details.baggage || "20kg";
  const refundable = outbound.refundable ?? details.refundable ?? false;
  const legs = outbound.legs || [];
  const seatsAvailable = outbound.seatsAvailable || details.seatsAvailable || null;
  const returnFlight = details.return || null;
  const isRoundTrip = !!details.isRoundTrip;
  const source = outbound.source || details.source || "db";
  const fareDetails = outbound.fareDetails || details.fareDetails || null;
  const timeLimit = outbound.timeLimit || details.timeLimit || null;

  const title = origin && destination
    ? `${origin} → ${destination}`
    : details.route || details.destination || `${b.bookingType || "flight"} Booking`;

  const paxCount = passengers.length || 1;
  const paxNames = passengers.map((p: any) => `${p.firstName || ""} ${p.lastName || ""}`.trim()).filter(Boolean);

  return {
    id: b.bookingRef || b.id,
    rawId: b.id,
    type: b.bookingType || "flight",
    status: b.status || "pending",
    title,
    amount: `৳${(b.totalAmount || 0).toLocaleString()}`,
    rawAmount: b.totalAmount || 0,
    date: b.bookedAt ? new Date(b.bookedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
    pnr: b.pnr || "—",
    pax: paxCount,
    paxNames,
    ticketNo: b.ticketNo || "—",
    paymentMethod: b.paymentMethod || "—",
    paymentStatus: b.paymentStatus || "—",
    paymentDeadline: b.paymentDeadline || null,
    // Flight details
    airline, airlineCode, flightNumber, cabinClass, aircraft,
    departureTime, arrivalTime, duration, stops, baggage, refundable,
    legs, seatsAvailable, returnFlight, isRoundTrip, source,
    fareDetails, timeLimit, origin, destination,
    // Raw
    details, passengers,
    contactInfo: b.contactInfo || {},
    addOns: details.addOns || {},
    baseFare: details.baseFare || 0,
    taxes: details.taxes || 0,
    serviceCharge: details.serviceCharge || 0,
  };
}

function fmtTime(dt?: string) {
  if (!dt) return "—";
  try { const d = new Date(dt); return isNaN(d.getTime()) ? dt : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return dt; }
}
function fmtDate(dt?: string) {
  if (!dt) return "—";
  try { const d = new Date(dt); return isNaN(d.getTime()) ? dt : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); } catch { return dt; }
}

function getAirlineLogo(code?: string): string | null {
  if (!code) return null;
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

/* ─── Booking Detail Dialog ─── */
const BookingDetailDialog = ({ booking, onClose }: { booking: any; onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState("flight");

  if (!booking) return null;

  const logo = getAirlineLogo(booking.airlineCode);
  const legs = booking.legs || [];

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Booking Details
            <Badge variant="outline" className={`text-[10px] ml-auto ${statusColors[booking.status] || ""}`}>
              {booking.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Flight summary card */}
        {booking.type === "flight" && booking.departureTime && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {logo && (
                  <img src={logo} alt={booking.airline} className="w-10 h-10 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{booking.airline}</span>
                    <span className="text-xs text-muted-foreground">{booking.flightNumber}</span>
                    {booking.aircraft && <span className="text-xs text-muted-foreground">· {booking.aircraft}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs">{booking.cabinClass}</span>
                    {booking.seatsAvailable && (
                      <span className="text-xs text-destructive font-semibold ml-2">{booking.seatsAvailable} Seats Left</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">{booking.amount}</p>
                  {booking.refundable && (
                    <Badge variant="outline" className="text-[9px] text-success border-success/30 mt-1">Refundable</Badge>
                  )}
                  {booking.status === "on_hold" && (
                    <Badge variant="outline" className="text-[9px] text-warning border-warning/30 mt-1 ml-1">Book & Hold</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs like reference */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none gap-0">
            {["Flight Details", "Fare Summary", "Baggage", "Passengers"].map((tab) => {
              const val = tab.toLowerCase().replace(/ /g, "-");
              return (
                <button
                  key={val}
                  onClick={() => setActiveTab(val)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === val
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </TabsList>

          {/* Flight Details Tab */}
          {activeTab === "flight-details" && (
            <div className="pt-4 space-y-4">
              {/* Route header */}
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{booking.origin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{booking.destination}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{fmtDate(booking.departureTime)}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">{booking.stops === 0 ? "Non-Stop" : `${booking.stops} Stop`}</span>
              </div>

              {/* Airline + Class info */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                {logo && <img src={logo} alt="" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <span className="text-sm font-medium">{booking.airline}</span>
                <span className="text-xs text-muted-foreground">{booking.flightNumber}</span>
                {booking.aircraft && <span className="text-xs text-muted-foreground">· {booking.aircraft}</span>}
                <span className="text-xs text-muted-foreground">· {booking.cabinClass}</span>
                {booking.seatsAvailable && (
                  <span className="text-xs text-destructive font-semibold">{booking.seatsAvailable} Seats Left</span>
                )}
              </div>

              {/* Segment timeline */}
              {legs.length > 0 ? (
                <div className="space-y-0">
                  {legs.map((leg: any, i: number) => {
                    const legLogo = getAirlineLogo(leg.airlineCode);
                    return (
                      <div key={i}>
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center w-6 shrink-0">
                            <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />
                            <div className="flex-1 w-[1.5px] bg-primary/30 my-1" />
                            <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-sm font-bold">{fmtTime(leg.departureTime)}</span>
                              <span className="text-sm">·</span>
                              <span className="text-sm font-medium">{leg.origin}</span>
                              {leg.originTerminal && <span className="text-xs text-muted-foreground">Terminal {leg.originTerminal}</span>}
                            </div>
                            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {legLogo && <img src={legLogo} alt="" className="w-4 h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span className="font-medium text-foreground">{leg.flightNumber}</span>
                              {leg.aircraft && <span>· {leg.aircraft}</span>}
                              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {leg.duration || `${leg.durationMinutes}m`}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-bold">{fmtTime(leg.arrivalTime)}</span>
                              <span className="text-sm">·</span>
                              <span className="text-sm font-medium">{leg.destination}</span>
                              {leg.destinationTerminal && <span className="text-xs text-muted-foreground">Terminal {leg.destinationTerminal}</span>}
                            </div>
                          </div>
                        </div>
                        {i < legs.length - 1 && (
                          <div className="flex gap-4 my-2">
                            <div className="w-6 flex justify-center"><div className="w-[1.5px] h-full bg-amber-400/50" /></div>
                            <div className="flex items-center gap-2 py-2 px-3 bg-warning/5 rounded-lg border border-warning/20 text-xs">
                              <Clock className="w-3.5 h-3.5 text-warning" />
                              <span className="font-medium text-warning">Connection</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Simple segment without legs */
                <div className="flex gap-4">
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />
                    <div className="flex-1 w-[1.5px] bg-primary/30 my-1" />
                    <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-bold">{fmtTime(booking.departureTime)}</span>
                      <span>·</span>
                      <span className="font-medium">{booking.origin}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      {logo && <img src={logo} alt="" className="w-4 h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      <span className="font-medium text-foreground">{booking.flightNumber}</span>
                      {booking.aircraft && <span>· {booking.aircraft}</span>}
                      <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {booking.duration}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold">{fmtTime(booking.arrivalTime)}</span>
                      <span>·</span>
                      <span className="font-medium">{booking.destination}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Luggage className="w-3.5 h-3.5" /> {booking.baggage} checked</span>
                {booking.refundable && <span className="flex items-center gap-1 text-success"><Shield className="w-3.5 h-3.5" /> Refundable</span>}
              </div>

              {/* Return flight */}
              {booking.isRoundTrip && booking.returnFlight && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Badge className="bg-accent/10 text-accent border-0 text-[10px]">Return</Badge>
                    <span>{booking.returnFlight.origin} → {booking.returnFlight.destination}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">{fmtDate(booking.returnFlight.departureTime)}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center w-6 shrink-0">
                      <CircleDot className="w-3.5 h-3.5 text-accent shrink-0" />
                      <div className="flex-1 w-[1.5px] bg-accent/30 my-1" />
                      <CircleDot className="w-3.5 h-3.5 text-accent shrink-0" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg font-bold">{fmtTime(booking.returnFlight.departureTime)}</span>
                        <span>·</span>
                        <span className="font-medium">{booking.returnFlight.origin}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="font-medium text-foreground">{booking.returnFlight.flightNumber}</span>
                        <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {booking.returnFlight.duration}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">{fmtTime(booking.returnFlight.arrivalTime)}</span>
                        <span>·</span>
                        <span className="font-medium">{booking.returnFlight.destination}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Fare Summary Tab */}
          {activeTab === "fare-summary" && (
            <div className="pt-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Base Fare</span><span className="font-medium">৳{(booking.baseFare || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxes & Fees</span><span className="font-medium">৳{(booking.taxes || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Service Charge</span><span className="font-medium">৳{(booking.serviceCharge || 0).toLocaleString()}</span></div>
                {booking.addOns?.total > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Add-ons</span><span className="font-medium">৳{booking.addOns.total.toLocaleString()}</span></div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span><span className="text-primary">{booking.amount}</span>
                </div>
              </div>
              {booking.fareDetails && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                  {booking.fareDetails.baseFare && <div className="flex justify-between"><span>Base</span><span>৳{booking.fareDetails.baseFare}</span></div>}
                  {booking.fareDetails.tax && <div className="flex justify-between"><span>Tax</span><span>৳{booking.fareDetails.tax}</span></div>}
                  {booking.fareDetails.discount && <div className="flex justify-between text-success"><span>Discount</span><span>-৳{booking.fareDetails.discount}</span></div>}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                <div><p className="text-xs text-muted-foreground">Payment Method</p><p className="font-medium capitalize">{booking.paymentMethod}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment Status</p><p className="font-medium capitalize">{booking.paymentStatus}</p></div>
              </div>
            </div>
          )}

          {/* Baggage Tab */}
          {activeTab === "baggage" && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <Luggage className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Checked Baggage</p>
                  <p className="text-xs text-muted-foreground">{booking.baggage} included</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                <Luggage className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cabin Baggage</p>
                  <p className="text-xs text-muted-foreground">7kg included</p>
                </div>
              </div>
              {booking.addOns?.baggage?.length > 0 && (
                <div className="p-3 border border-border rounded-lg">
                  <p className="text-xs font-medium mb-2">Extra Baggage</p>
                  {booking.addOns.baggage.map((b: string, i: number) => (
                    <p key={i} className="text-xs text-muted-foreground">• {b}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Passengers Tab */}
          {activeTab === "passengers" && (
            <div className="pt-4 space-y-3">
              {booking.passengers?.length > 0 ? booking.passengers.map((p: any, i: number) => (
                <div key={i} className="p-4 border border-border rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold">{p.title} {p.firstName} {p.lastName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {p.dob && <div><span className="text-muted-foreground">DOB:</span> {p.dob}</div>}
                    {p.nationality && <div><span className="text-muted-foreground">Nationality:</span> {p.nationality}</div>}
                    {p.passport && <div><span className="text-muted-foreground">Passport:</span> {p.passport}</div>}
                    {p.email && <div><span className="text-muted-foreground">Email:</span> {p.email}</div>}
                    {p.phone && <div><span className="text-muted-foreground">Phone:</span> {p.phone}</div>}
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6">No passenger info available</p>
              )}
            </div>
          )}
        </Tabs>

        {/* Booking meta */}
        <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
          <div><p className="text-xs text-muted-foreground">Booking ID</p><p className="font-bold font-mono text-xs">{booking.id}</p></div>
          <div><p className="text-xs text-muted-foreground">Booked</p><p className="font-medium">{booking.date}</p></div>
        </div>

        {/* Action buttons */}
        {booking.status === "on_hold" && (
          <Button className="w-full font-bold" onClick={() => { window.location.href = "/dashboard/payments"; }}>
            <CreditCard className="w-4 h-4 mr-1.5" /> Pay Now
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

const DashboardBookings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [perPage, setPerPage] = useState("10");
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<any>(null);

  const { data, isLoading, error, refetch } = useDashboardBookings({
    status: activeTab !== "All" ? activeTab : undefined,
    search: search || undefined,
    limit: Number(perPage),
    page,
  });

  const resolved = (data as any) || {};
  const rawBookings = resolved?.data || resolved?.bookings || [];
  const bookings = rawBookings.map(mapBooking);

  const tabCounts: Record<string, number> = resolved?.tabCounts || {};
  if (!tabCounts["All"]) {
    tabCounts["All"] = bookings.length;
    statusTabs.forEach(tab => {
      if (tab !== "All") {
        const tabKey = tab.toLowerCase().replace(/ /g, "_");
        tabCounts[tab] = bookings.filter((b: any) => b.status?.toLowerCase() === tabKey || b.status?.toLowerCase() === tab.toLowerCase()).length;
      }
    });
  }

  const total = resolved?.total || bookings.length;
  const totalPages = Math.ceil(total / Number(perPage)) || 1;

  const paginatedBookings = bookings.slice((page - 1) * Number(perPage), page * Number(perPage));

  return (
    <div className="space-y-6">
      <PaymentReminderBanner bookings={rawBookings} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Bookings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{total} total bookings</p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => {
          downloadCSV('bookings', ['ID', 'Type', 'Route', 'Date', 'Status', 'Amount'],
            bookings.map((b: any) => [b.id, b.type, b.title, b.date, b.status, b.amount]));
          toast({ title: "Exported", description: "Bookings CSV downloaded." });
        }}><Download className="w-4 h-4 mr-1.5" /> Export</Button>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border pb-px -mx-1 px-1">
        {statusTabs.map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {tab}
            {(tabCounts[tab] ?? 0) > 0 && (
              <span className={`text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{tabCounts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by booking ID, destination, PNR..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="flight">Flights</SelectItem><SelectItem value="hotel">Hotels</SelectItem><SelectItem value="visa">Visa</SelectItem><SelectItem value="holiday">Holidays</SelectItem></SelectContent>
        </Select>
      </div>

      <DataLoader isLoading={isLoading} error={error} skeleton="table" retry={refetch}>
        <Card>
          <CardContent className="p-0 table-responsive">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead><TableHead>Details</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead><TableHead className="hidden lg:table-cell">PNR</TableHead>
                  <TableHead className="hidden sm:table-cell">Pax</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBookings.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <Plane className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />No bookings found
                  </TableCell></TableRow>
                ) : paginatedBookings.map((booking: any) => {
                  const Icon = typeIcons[booking.type] || Plane;
                  return (
                    <TableRow key={booking.rawId || booking.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewBooking(booking)}>
                      <TableCell className="font-mono text-xs font-semibold">{booking.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                          <div className="min-w-0"><span className="font-medium text-sm block truncate max-w-[150px] sm:max-w-none">{booking.title}</span>
                            {booking.airline && <span className="text-[10px] text-muted-foreground">{booking.airline} · {booking.flightNumber}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{booking.date}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {booking.pnr && booking.pnr !== "—" ? <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-bold">{booking.pnr}</code> : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{booking.pax}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${statusColors[booking.status] || ""}`}>{booking.status}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-sm">{booking.amount}</TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewBooking(booking); }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              generateTicketPDF({
                                id: booking.id, pnr: booking.pnr || booking.id, airline: booking.airline || "Seven Trip",
                                flightNo: booking.flightNumber || "ST-001",
                                from: booking.origin || "Origin", to: booking.destination || "Destination",
                                date: booking.date, time: fmtTime(booking.departureTime), passenger: booking.paxNames?.[0] || "Traveller",
                                seat: "—", class: booking.cabinClass || "Economy",
                              });
                              toast({ title: "Downloaded", description: `E-Ticket PDF saved` });
                            }}><FileText className="w-4 h-4 mr-2" /> Download E-Ticket</DropdownMenuItem>
                            {(booking.status === "Confirmed" || booking.status === "confirmed") && (<>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Request Submitted", description: "Reissue request has been submitted." }); }}><RotateCcw className="w-4 h-4 mr-2" /> Request Reissue</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast({ title: "Request Submitted", description: "Refund request has been submitted." }); }}><XCircle className="w-4 h-4 mr-2" /> Request Refund</DropdownMenuItem>
                            </>)}
                            {(booking.status === "On Hold" || booking.status === "on_hold") && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = "/dashboard/payments"; }}><CreditCard className="w-4 h-4 mr-2" /> Pay Now</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataLoader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show</span>
          <Select value={perPage} onValueChange={(v) => { setPerPage(v); setPage(1); }}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
          </Select>
          <span className="text-muted-foreground">per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">{page}</Button>
          <Button variant="outline" size="sm" className="h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

      <BookingDetailDialog booking={viewBooking} onClose={() => setViewBooking(null)} />
    </div>
  );
};

export default DashboardBookings;
