import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plane, Building2, Search, Eye, Download, MoreHorizontal, RotateCcw, XCircle, FileText, Globe, Palmtree, CreditCard } from "lucide-react";

const statusTabs = [
  "All", "On Hold", "Pending", "In Progress", "Confirmed", "Completed",
  "Void", "Refund", "Exchange", "Expired", "Cancelled", "Un-Confirmed"
];

const mockBookings = [
  { id: "BK-20260001", type: "flight", title: "Dhaka → Cox's Bazar", date: "2026-03-15", status: "Confirmed", amount: "৳4,500", pax: 2, pnr: "ABC123", ticketNo: "997-2435678901" },
  { id: "BK-20260002", type: "hotel", title: "Sea Pearl Beach Resort", date: "2026-03-16", status: "Pending", amount: "৳17,000", pax: 2, pnr: "—", ticketNo: "—" },
  { id: "BK-20260003", type: "flight", title: "Dhaka → Bangkok", date: "2026-04-01", status: "Confirmed", amount: "৳32,000", pax: 1, pnr: "DEF456", ticketNo: "997-2435678902" },
  { id: "BK-20260004", type: "visa", title: "Thailand Tourist Visa", date: "2026-03-25", status: "In Progress", amount: "৳4,500", pax: 1, pnr: "—", ticketNo: "—" },
  { id: "BK-20260005", type: "flight", title: "Dhaka → Singapore", date: "2026-02-10", status: "Completed", amount: "৳28,500", pax: 2, pnr: "GHI789", ticketNo: "997-2435678903" },
  { id: "BK-20260006", type: "hotel", title: "Grand Sylhet Hotel", date: "2026-01-20", status: "Cancelled", amount: "৳5,900", pax: 3, pnr: "—", ticketNo: "—" },
  { id: "BK-20260007", type: "flight", title: "Dhaka → Kolkata", date: "2026-01-05", status: "Refund", amount: "৳8,200", pax: 1, pnr: "JKL012", ticketNo: "997-2435678904" },
  { id: "BK-20260008", type: "holiday", title: "Maldives Package 3N/4D", date: "2026-05-10", status: "On Hold", amount: "৳68,000", pax: 2, pnr: "—", ticketNo: "—" },
  { id: "BK-20260009", type: "flight", title: "Dhaka → Dubai", date: "2025-12-20", status: "Expired", amount: "৳42,000", pax: 1, pnr: "MNO345", ticketNo: "—" },
  { id: "BK-20260010", type: "flight", title: "Dhaka → Jeddah", date: "2026-06-15", status: "Un-Confirmed", amount: "৳55,000", pax: 2, pnr: "PQR678", ticketNo: "—" },
];

const statusColors: Record<string, string> = {
  "Confirmed": "bg-success/10 text-success border-success/20",
  "Pending": "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Completed": "bg-muted text-muted-foreground border-border",
  "Cancelled": "bg-destructive/10 text-destructive border-destructive/20",
  "Void": "bg-destructive/10 text-destructive border-destructive/20",
  "Refund": "bg-accent/10 text-accent border-accent/20",
  "Exchange": "bg-primary/10 text-primary border-primary/20",
  "Expired": "bg-muted text-muted-foreground border-border",
  "On Hold": "bg-warning/10 text-warning border-warning/20",
  "Un-Confirmed": "bg-destructive/10 text-destructive border-destructive/20",
};

const typeIcons: Record<string, typeof Plane> = {
  flight: Plane,
  hotel: Building2,
  visa: Globe,
  holiday: Palmtree,
};

const DashboardBookings = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState("10");

  const filtered = mockBookings.filter((b) => {
    if (activeTab !== "All" && b.status !== activeTab) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase()) && !b.pnr.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabCounts = statusTabs.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? mockBookings.length : mockBookings.filter(b => b.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockBookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Status Tabs — scrollable */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border pb-px -mx-1 px-1">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{tabCounts[tab]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by booking ID, destination, PNR, or ticket number..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="flight">Flights</SelectItem>
            <SelectItem value="hotel">Hotels</SelectItem>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="holiday">Holidays</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">PNR</TableHead>
                <TableHead className="hidden sm:table-cell">Pax</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <Plane className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    No bookings found for "{activeTab}"
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((booking) => {
                  const Icon = typeIcons[booking.type] || Plane;
                  return (
                    <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs font-semibold">{booking.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium text-sm block">{booking.title}</span>
                            {booking.ticketNo !== "—" && <span className="text-[10px] text-muted-foreground font-mono">{booking.ticketNo}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{booking.date}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {booking.pnr !== "—" ? (
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-bold">{booking.pnr}</code>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{booking.pax}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[booking.status] || ""}`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">{booking.amount}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem><FileText className="w-4 h-4 mr-2" /> Download E-Ticket</DropdownMenuItem>
                            {booking.status === "Confirmed" && (
                              <>
                                <DropdownMenuItem><RotateCcw className="w-4 h-4 mr-2" /> Request Reissue</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><XCircle className="w-4 h-4 mr-2" /> Request Refund</DropdownMenuItem>
                              </>
                            )}
                            {booking.status === "On Hold" && (
                              <DropdownMenuItem><CreditCard className="w-4 h-4 mr-2" /> Pay Now</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show</span>
          <Select value={perPage} onValueChange={setPerPage}>
            <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">per page</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="h-8 w-8 bg-primary text-primary-foreground">1</Button>
          <Button variant="outline" size="sm" className="h-8 w-8">2</Button>
          <Button variant="outline" size="sm" className="h-8">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardBookings;
