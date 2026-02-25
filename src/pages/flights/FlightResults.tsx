import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Plane, Clock, ArrowRight, Filter, X, Luggage, Wifi,
  UtensilsCrossed, SlidersHorizontal, ChevronDown, ChevronUp, Shield, AlertCircle, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const mockFlights = [
  {
    id: 1, airline: "Biman Bangladesh", code: "BG", flightNo: "BG-435",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "07:30", arriveTime: "08:35", duration: "1h 05m",
    stops: 0, price: 4200, originalPrice: 5100, class: "Economy",
    baggage: "20kg", cabinBag: "7kg", amenities: ["meal", "wifi"],
    aircraft: "Boeing 737-800", fareRules: "Non-refundable. Date change ৳500. Name correction ৳300.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/BG.png"
  },
  {
    id: 2, airline: "US-Bangla Airlines", code: "BS", flightNo: "BS-141",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "09:15", arriveTime: "10:20", duration: "1h 05m",
    stops: 0, price: 3800, originalPrice: 4500, class: "Economy",
    baggage: "20kg", cabinBag: "7kg", amenities: ["meal"],
    aircraft: "ATR 72-600", fareRules: "Non-refundable. Date change ৳500.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/BS.png"
  },
  {
    id: 3, airline: "NOVOAIR", code: "VQ", flightNo: "VQ-901",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "11:45", arriveTime: "12:50", duration: "1h 05m",
    stops: 0, price: 4500, originalPrice: 5200, class: "Economy",
    baggage: "20kg", cabinBag: "7kg", amenities: ["meal", "wifi"],
    aircraft: "ATR 72-600", fareRules: "Partially refundable. Cancel ৳1,000. Date change free.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/VQ.png"
  },
  {
    id: 4, airline: "Air Astra", code: "2A", flightNo: "2A-702",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "14:00", arriveTime: "15:05", duration: "1h 05m",
    stops: 0, price: 4100, originalPrice: 4800, class: "Economy",
    baggage: "20kg", cabinBag: "7kg", amenities: ["meal"],
    aircraft: "ATR 72-600", fareRules: "Non-refundable. Date change ৳800.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/2A.png"
  },
  {
    id: 5, airline: "Biman Bangladesh", code: "BG", flightNo: "BG-437",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "16:30", arriveTime: "17:35", duration: "1h 05m",
    stops: 0, price: 4800, originalPrice: 5500, class: "Economy",
    baggage: "30kg", cabinBag: "7kg", amenities: ["meal", "wifi"],
    aircraft: "Boeing 737-800", fareRules: "Partially refundable. Cancel ৳1,500. Date change ৳500.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/BG.png"
  },
  {
    id: 6, airline: "US-Bangla Airlines", code: "BS", flightNo: "BS-145",
    from: "DAC", fromFull: "Hazrat Shahjalal Intl", to: "CXB", toFull: "Cox's Bazar Airport",
    departTime: "19:00", arriveTime: "20:05", duration: "1h 05m",
    stops: 0, price: 3600, originalPrice: 4200, class: "Economy",
    baggage: "20kg", cabinBag: "7kg", amenities: ["meal"],
    aircraft: "Dash 8-400", fareRules: "Non-refundable. No date change.",
    logo: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/BS.png"
  },
];

const airlines = ["Biman Bangladesh", "US-Bangla Airlines", "NOVOAIR", "Air Astra"];
const timeSlots = ["Morning (06-12)", "Afternoon (12-18)", "Evening (18-24)"];

const FlightResults = () => {
  const [sortBy, setSortBy] = useState("cheapest");
  const [priceRange, setPriceRange] = useState([3000, 6000]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFlight, setExpandedFlight] = useState<number | null>(null);

  const toggleAirline = (a: string) => {
    setSelectedAirlines(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const filtered = mockFlights
    .filter(f => f.price >= priceRange[0] && f.price <= priceRange[1])
    .filter(f => selectedAirlines.length === 0 || selectedAirlines.includes(f.airline))
    .sort((a, b) => {
      if (sortBy === "cheapest") return a.price - b.price;
      if (sortBy === "earliest") return a.departTime.localeCompare(b.departTime);
      if (sortBy === "fastest") return a.duration.localeCompare(b.duration);
      return 0;
    });

  const cheapest = Math.min(...mockFlights.map(f => f.price));

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold mb-3">Price Range</h4>
        <Slider value={priceRange} onValueChange={setPriceRange} min={2000} max={8000} step={100} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">Stops</h4>
        <div className="space-y-2">
          {["Non-stop", "1 Stop", "2+ Stops"].map((s, i) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <Checkbox defaultChecked={i === 0} />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">Airlines</h4>
        <div className="space-y-2">
          {airlines.map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedAirlines.includes(a)} onCheckedChange={() => toggleAirline(a)} />
              <span className="text-sm">{a}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">Departure Time</h4>
        <div className="space-y-2">
          {timeSlots.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              <span className="text-sm">{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold mb-3">Baggage</h4>
        <div className="space-y-2">
          {["20 kg", "30 kg", "40 kg"].map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <Checkbox />
              <span className="text-sm">{b}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-card border-b border-border pt-20 lg:pt-28 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                Dhaka <ArrowRight className="w-5 h-5 text-primary" /> Cox's Bazar
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Thu, 26 Feb 2026 • 1 Adult • Economy • <strong className="text-foreground">{filtered.length} flights</strong> found
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Modify Search</Button>
              <Badge className="bg-success/10 text-success border-0 font-semibold h-9 px-3">Cheapest from ৳{cheapest.toLocaleString()}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="sticky top-28">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs text-primary h-7"
                    onClick={() => { setSelectedAirlines([]); setPriceRange([2000, 8000]); }}>Reset</Button>
                </div>
                <FilterPanel />
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {[
                  { value: "cheapest", label: "Cheapest", sub: `৳${cheapest.toLocaleString()}` },
                  { value: "earliest", label: "Earliest", sub: "07:30" },
                  { value: "fastest", label: "Fastest", sub: "1h 05m" },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                      sortBy === s.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className="block text-[10px] font-medium opacity-75">{s.sub}</span>
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4 mr-1" /> Filters
              </Button>
            </div>

            {filtered.map((flight) => (
              <Card key={flight.id} className={`hover:shadow-lg transition-all overflow-hidden ${expandedFlight === flight.id ? 'ring-1 ring-primary/30' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={flight.logo} alt={flight.airline} className="w-8 h-8 object-contain" />
                        <div className="flex-1">
                          <p className="text-sm font-bold">{flight.airline}</p>
                          <p className="text-xs text-muted-foreground">{flight.flightNo} • {flight.class} • {flight.aircraft}</p>
                        </div>
                        {flight.price === cheapest && (
                          <Badge className="bg-success/10 text-success border-0 text-[10px] font-bold">Cheapest</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-black">{flight.departTime}</p>
                          <p className="text-xs font-semibold text-muted-foreground">{flight.from}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-[11px] text-muted-foreground font-medium">{flight.duration}</p>
                          <div className="w-full flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full border-2 border-primary" />
                            <div className="flex-1 h-px bg-border relative">
                              <Plane className="w-3.5 h-3.5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <p className="text-[11px] text-success font-semibold">
                            {flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop`}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-black">{flight.arriveTime}</p>
                          <p className="text-xs font-semibold text-muted-foreground">{flight.to}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Luggage className="w-3.5 h-3.5" /> {flight.baggage}</span>
                        <span className="flex items-center gap-1">🎒 {flight.cabinBag}</span>
                        {flight.amenities.includes("meal") && (
                          <span className="flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5" /> Meal</span>
                        )}
                        {flight.amenities.includes("wifi") && (
                          <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> WiFi</span>
                        )}
                      </div>

                      <button
                        className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold hover:underline"
                        onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                      >
                        Flight Details {expandedFlight === flight.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="sm:w-48 border-t sm:border-t-0 sm:border-l border-border p-4 sm:p-5 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-muted/30">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground line-through">৳{flight.originalPrice.toLocaleString()}</p>
                        <p className="text-2xl font-black text-primary">৳{flight.price.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">per person</p>
                        <p className="text-[10px] text-success font-semibold">Save ৳{(flight.originalPrice - flight.price).toLocaleString()}</p>
                      </div>
                      <Button className="font-bold shadow-lg shadow-primary/20 h-10 px-6" asChild>
                        <Link to="/flights/book">Select <ArrowRight className="w-4 h-4 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedFlight === flight.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border p-4 sm:p-5 bg-muted/20">
                          <div className="grid sm:grid-cols-3 gap-6">
                            {/* Flight Info */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Flight Info</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Aircraft</span><span className="font-medium">{flight.aircraft}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{flight.duration}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Departure</span><span className="font-medium">{flight.departTime} ({flight.fromFull})</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Arrival</span><span className="font-medium">{flight.arriveTime} ({flight.toFull})</span></div>
                              </div>
                            </div>
                            {/* Baggage */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Baggage</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Checked</span><span className="font-medium">{flight.baggage}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Cabin</span><span className="font-medium">{flight.cabinBag}</span></div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><Info className="w-3 h-3" /> Extra baggage available at counter</div>
                              </div>
                            </div>
                            {/* Fare Rules */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Fare Rules</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{flight.fareRules}</p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-warning">
                                <AlertCircle className="w-3 h-3" /> Fare rules subject to airline policy
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Plane className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No flights found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <Button className="w-full mt-6" onClick={() => setShowFilters(false)}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightResults;
