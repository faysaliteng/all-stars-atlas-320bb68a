import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, User, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const posts = [
  {
    id: 1,
    title: "Top 10 Things to Do in Cox's Bazar in 2026",
    excerpt: "From the world's longest natural sea beach to hidden waterfalls and local seafood, discover the best experiences Cox's Bazar has to offer this year.",
    category: "Destinations",
    author: "Rafiq Ahmed",
    date: "Feb 25, 2026",
    readTime: "5 min read",
    img: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/promotion/Cox%27s_Bazar.jpg",
  },
  {
    id: 2,
    title: "Complete Guide to Thailand Tourist Visa for Bangladeshis",
    excerpt: "Everything you need to know about applying for a Thailand tourist visa — requirements, documents, processing time, and tips for approval.",
    category: "Visa Guide",
    author: "Nusrat Jahan",
    date: "Feb 20, 2026",
    readTime: "7 min read",
    img: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/promotion/Bangkok.jpg",
  },
  {
    id: 3,
    title: "How to Find the Cheapest Flights from Dhaka",
    excerpt: "Expert tips on booking affordable flights — from flexible dates and fare alerts to student discounts and the best time to book.",
    category: "Travel Tips",
    author: "Tanvir Hasan",
    date: "Feb 15, 2026",
    readTime: "4 min read",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&q=80",
  },
  {
    id: 4,
    title: "Best Hotels in Sylhet for a Tea Garden Getaway",
    excerpt: "Explore our handpicked selection of resorts and boutique hotels near Sylhet's famous tea gardens, perfect for a relaxing weekend escape.",
    category: "Hotels",
    author: "Sabrina Akter",
    date: "Feb 10, 2026",
    readTime: "6 min read",
    img: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/promotion/AzOSQlJV2UD8QhKVOKLteYWlrI9brl.png",
  },
  {
    id: 5,
    title: "Medical Tourism in India: A Complete Guide for Bangladeshis",
    excerpt: "Why thousands of Bangladeshis travel to India for medical treatment each year, and how Seven Trip makes it hassle-free.",
    category: "Medical",
    author: "Kamal Hossain",
    date: "Feb 5, 2026",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  },
  {
    id: 6,
    title: "eSIM vs Physical SIM: Which Should You Choose for Travel?",
    excerpt: "A comparison of eSIM and traditional SIM cards for international travel — convenience, cost, coverage, and compatibility explained.",
    category: "Travel Tips",
    author: "Tanvir Hasan",
    date: "Jan 28, 2026",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80",
  },
  {
    id: 7,
    title: "Maldives on a Budget: Is It Possible from Bangladesh?",
    excerpt: "Yes! Discover how to plan an affordable Maldives trip from Dhaka — budget guesthouses, local island tips, and package deals.",
    category: "Destinations",
    author: "Rafiq Ahmed",
    date: "Jan 22, 2026",
    readTime: "6 min read",
    img: "https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/promotion/Maafushi.jpg",
  },
  {
    id: 8,
    title: "What to Pack for a Umrah Trip: Essential Checklist",
    excerpt: "A comprehensive packing list for Umrah travellers from Bangladesh — from ihram clothing to travel essentials and important documents.",
    category: "Travel Tips",
    author: "Nusrat Jahan",
    date: "Jan 15, 2026",
    readTime: "5 min read",
    img: "https://images.unsplash.com/photo-1591604129939-f1efa4d99f7e?w=600&q=80",
  },
];

const categories = ["All", "Destinations", "Travel Tips", "Visa Guide", "Hotels", "Medical"];

const Blog = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = posts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="relative bg-gradient-to-br from-[hsl(217,91%,50%)] to-[hsl(224,70%,28%)] pt-24 lg:pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Travel Blog</h1>
          <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto">
            Tips, guides, and inspiration for your next adventure
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10 h-11" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {filtered.length > 0 && activeCategory === "All" && !search && (
            <Card className="mb-8 overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="aspect-[16/10] md:aspect-auto">
                  <img src={filtered[0].img} alt={filtered[0].title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-6 sm:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-3 text-xs">{filtered[0].category}</Badge>
                  <h2 className="text-xl sm:text-2xl font-black mb-3 leading-tight">{filtered[0].title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{filtered[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {filtered[0].author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {filtered[0].readTime}</span>
                    <span>{filtered[0].date}</span>
                  </div>
                  <Button className="w-fit font-bold">
                    Read Article <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Posts Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeCategory === "All" && !search ? filtered.slice(1) : filtered).map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="text-[10px] mb-2">{post.category}</Badge>
                    <h3 className="font-bold text-sm mb-2 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
