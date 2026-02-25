import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, CreditCard, Plane, Clock, ArrowRight, MapPin, TrendingUp, Calendar, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Total Bookings", value: "12", icon: Ticket, color: "text-primary", bg: "bg-primary/10", change: "+3 this month" },
  { label: "Active Trips", value: "2", icon: Plane, color: "text-accent", bg: "bg-accent/10", change: "1 upcoming" },
  { label: "Total Spent", value: "৳2,47,900", icon: CreditCard, color: "text-success", bg: "bg-success/10", change: "৳87K this year" },
  { label: "Pending", value: "1", icon: Clock, color: "text-warning", bg: "bg-warning/10", change: "Payment due" },
];

const recentBookings = [
  { id: "BK-20260001", title: "Dhaka → Cox's Bazar", date: "Mar 15, 2026", status: "confirmed", amount: "৳4,500", type: "flight" },
  { id: "BK-20260002", title: "Sea Pearl Beach Resort", date: "Mar 16, 2026", status: "pending", amount: "৳17,000", type: "hotel" },
  { id: "BK-20260003", title: "Dhaka → Bangkok", date: "Apr 1, 2026", status: "confirmed", amount: "৳32,000", type: "flight" },
  { id: "BK-20260004", title: "Thailand Tourist Visa", date: "Mar 25, 2026", status: "in-progress", amount: "৳4,500", type: "visa" },
];

const spendingData = [
  { month: "Sep", amount: 12000 },
  { month: "Oct", amount: 28000 },
  { month: "Nov", amount: 8000 },
  { month: "Dec", amount: 45000 },
  { month: "Jan", amount: 32000 },
  { month: "Feb", amount: 17000 },
];

const pieData = [
  { name: "Flights", value: 65, color: "hsl(217, 91%, 50%)" },
  { name: "Hotels", value: 25, color: "hsl(24, 100%, 50%)" },
  { name: "Visa", value: 7, color: "hsl(167, 72%, 41%)" },
  { name: "Holidays", value: 3, color: "hsl(270, 60%, 50%)" },
];

const quickActions = [
  { label: "Book a Flight", href: "/", icon: Plane, desc: "Search & compare fares" },
  { label: "My Bookings", href: "/dashboard/bookings", icon: Ticket, desc: "View all bookings" },
  { label: "Manage Travellers", href: "/dashboard/travellers", icon: MapPin, desc: "Edit saved profiles" },
];

const upcomingTrip = {
  title: "Dhaka → Cox's Bazar",
  date: "Mar 15, 2026",
  daysLeft: 18,
  flight: "BG-435 · 07:30 AM",
  hotel: "Sea Pearl Beach Resort",
  duration: "3 Nights",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  "in-progress": "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, John 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your travel overview for February 2026</p>
        </div>
        <Button asChild>
          <Link to="/"><Plane className="w-4 h-4 mr-1.5" /> Book New Trip</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-success font-medium mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Trip Banner */}
      <Card className="overflow-hidden bg-gradient-to-br from-primary to-[hsl(224,70%,28%)] text-primary-foreground">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold">{upcomingTrip.daysLeft} days left</Badge>
                <span className="text-xs text-white/60">Next Trip</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{upcomingTrip.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {upcomingTrip.date}</span>
                <span className="flex items-center gap-1"><Plane className="w-3.5 h-3.5" /> {upcomingTrip.flight}</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {upcomingTrip.duration}</span>
              </div>
            </div>
            <Button variant="secondary" className="font-bold shadow-lg" asChild>
              <Link to="/dashboard/bookings">View Details <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Spending Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={spendingData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v / 1000}K`} />
                <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Spent']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(220, 13%, 91%)', fontSize: '13px' }} />
                <Bar dataKey="amount" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Breakdown Pie */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Booking Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name} {d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.href}>
            <Card className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold">{action.label}</span>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/bookings" className="text-primary text-sm font-medium">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {b.type === "flight" ? <Plane className="w-4 h-4" /> : b.type === "hotel" ? <MapPin className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.id} • {b.date}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>
                  {b.status}
                </span>
                <span className="text-sm font-semibold hidden sm:block">{b.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
