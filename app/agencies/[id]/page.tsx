"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { 
  Star, 
  MapPin, 
  CheckCircle2,
  XCircle,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  Users,
  Award,
  ArrowLeft,
  Image as ImageIcon,
  Twitter,
  BarChart3,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAgency } from "@/hooks/use-agency";
import { Loading } from "@/components/loading";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { ReviewForm } from "@/components/review-form";
import { shareUrl } from "@/lib/share";

export default function AgencyProfilePage() {
  const params = useParams();
  const agencyId = params?.id as string;
  const { agency, loading, error } = useAgency(agencyId);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Link href="/agencies" className="cursor-pointer">
              <Button variant="ghost" className="gap-2 cursor-pointer mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Profiles
              </Button>
            </Link>
            <div className="text-center py-20">
              <h1 className="text-2xl font-semibold mb-4">Agency not found</h1>
              <p className="text-foreground/60 mb-6">{error || "The agency you're looking for doesn't exist."}</p>
              <Link href="/agencies">
                <Button className="cursor-pointer">Browse Agencies</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link href="/agencies" className="cursor-pointer">
              <Button variant="ghost" className="gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to Profiles
              </Button>
            </Link>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                {/* Profile Image or Initial */}
                <div className="relative shrink-0">
                  {agency.logo_url ? (
                    <img
                      src={agency.logo_url}
                      alt={agency.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-foreground/10 border-2 border-border flex items-center justify-center">
                      <span className="text-2xl font-semibold text-foreground">
                        {agency.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {agency.verified ? (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl sm:text-4xl font-semibold">{agency.name}</h1>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-foreground/20 text-foreground/40" />
                  <span className="font-medium text-lg">{agency.rating}</span>
                  <span className="text-sm text-foreground/50">({agency.reviews} reviews)</span>
                </div>
                {(agency as any).profile_type === "kol" && (agency as any).twitter_handle && (
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <Twitter className="h-4 w-4" />
                    <a 
                      href={`https://twitter.com/${(agency as any).twitter_handle.replace(/^@/, "")}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline cursor-pointer"
                    >
                      @{(agency as any).twitter_handle.replace(/^@/, "")}
                    </a>
                  </div>
                )}
                {agency.location && (
                  <div className="flex items-center gap-2 text-sm text-foreground/60">
                    <MapPin className="h-4 w-4" />
                    {agency.location}
                  </div>
                )}
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground/70 border border-border">
                  {(agency as any).profile_type === "kol" ? "KOL" : agency.niche}
                </span>
              </div>
              {agency.description && (
                <p className="text-base text-foreground/70 max-w-3xl leading-relaxed">
                  {agency.description}
                </p>
              )}
            </div>

            {/* Stats - Different for Agency vs KOL */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {((agency as any).profile_type === "kol" ? [
                { icon: Twitter, label: "Followers", value: (agency as any).twitter_followers ? `${((agency as any).twitter_followers / 1000).toFixed(1)}K` : null },
                { icon: BarChart3, label: "Engagement", value: (agency as any).engagement_rate ? `${(agency as any).engagement_rate}%` : null },
                { icon: TrendingUp, label: "Reviews", value: `${agency.reviews}` },
                { icon: Award, label: "Rating", value: `${agency.rating}/5` },
              ] : [
                { icon: Calendar, label: "Founded", value: agency.founded },
                { icon: Users, label: "Team Size", value: (agency as any).team_size },
                { icon: TrendingUp, label: "Reviews", value: `${agency.reviews}` },
                { icon: Award, label: "Rating", value: `${agency.rating}/5` },
              ]).filter(stat => stat.value).map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="p-4 rounded-lg border border-border bg-card hover:border-foreground/30 transition-all group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <stat.icon className="h-5 w-5 text-foreground/40 mb-2 group-hover:text-foreground transition-colors" />
                  </motion.div>
                  <div className="text-xl font-semibold mb-1">{stat.value}</div>
                  <div className="text-xs text-foreground/50">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {agency.email && (
                <Button size="lg" className="gap-2 cursor-pointer" asChild>
                  <a href={`mailto:${agency.email}`}>
                    <Mail className="h-4 w-4" />
                    Contact {(agency as any).profile_type === "kol" ? "KOL" : "Agency"}
                  </a>
                </Button>
              )}
              {(agency as any).profile_type === "kol" && (agency as any).twitter_handle && (
                <Button size="lg" variant="outline" className="gap-2 cursor-pointer" asChild>
                  <a 
                    href={`https://twitter.com/${(agency as any).twitter_handle.replace(/^@/, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    <Twitter className="h-4 w-4" />
                    View Twitter
                  </a>
                </Button>
              )}
              {agency.website && (
                <Button size="lg" variant="outline" className="gap-2 cursor-pointer" asChild>
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Globe className="h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
              <Button 
                size="lg" 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => shareUrl(
                  window.location.href,
                  `${agency.name} - ${(agency as any).profile_type === "kol" ? "KOL" : "Marketing Agency"}`,
                  `Check out ${agency.name} on crewdeck.`
                )}
              >
                Share Profile
              </Button>
            </div>
          </motion.div>

          {/* Services Section - Agency only */}
          {(agency as any).profile_type !== "kol" && agency.services.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-semibold mb-6">Services</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {agency.services.map((service, index) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="p-3 rounded-lg border border-border bg-card hover:border-foreground/30 transition-all group cursor-default"
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-foreground/40 group-hover:text-foreground transition-colors" />
                      </motion.div>
                      <span className="text-sm font-medium">{service}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs font-medium text-foreground/50 mb-1">Pricing Range</p>
                <p className="text-xl font-semibold">{agency.priceRange}</p>
                <p className="text-xs text-foreground/50 mt-1">per project (varies by scope)</p>
              </div>
            </motion.section>
          )}

          {/* KOL Content Types & Pricing Section */}
          {(agency as any).profile_type === "kol" && (agency as any).content_types && (agency as any).content_types.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-semibold mb-6">Content Types & Pricing</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(agency as any).content_types.map((contentType: string, index: number) => {
                  let price = null;
                  if (contentType === "threads" && (agency as any).price_per_thread) {
                    price = (agency as any).price_per_thread;
                  } else if (contentType === "videos" && (agency as any).price_per_video) {
                    price = (agency as any).price_per_video;
                  } else if (contentType === "spaces" && (agency as any).price_per_space) {
                    price = (agency as any).price_per_space;
                  }
                  
                  return (
                    <motion.div
                      key={contentType}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="p-5 rounded-lg border border-border bg-card hover:border-foreground/30 transition-all"
                    >
                      <h3 className="text-lg font-medium mb-2 capitalize">{contentType}</h3>
                      {price ? (
                        <p className="text-2xl font-semibold">${price.toLocaleString()}</p>
                      ) : (
                        <p className="text-sm text-foreground/50">Contact for pricing</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {(agency as any).solana_wallet && (
                <div className="mt-6 p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-foreground/60" />
                    <span className="text-sm font-medium text-foreground/80">Solana Wallet</span>
                    {(agency as any).wallet_verified && (
                      <CheckCircle2 className="h-4 w-4 text-foreground/40" />
                    )}
                  </div>
                  <p className="text-xs font-mono text-foreground/60 break-all">
                    {(agency as any).solana_wallet}
                  </p>
                </div>
              )}
            </motion.section>
          )}

          {/* Proof of Work Section */}
          {agency.portfolio && Array.isArray(agency.portfolio) && agency.portfolio.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-semibold mb-6">Proof of Work</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agency.portfolio.map((project, index) => (
                  <motion.div
                    key={project.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative p-5 rounded-lg border border-border bg-card hover:border-foreground/30 hover:shadow-lg transition-all cursor-default"
                  >
                    {project.image ? (
                      <div className="mb-3 rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                          src={project.image}
                          alt={project.title || "Portfolio item"}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            // Hide broken images
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mb-3 rounded-lg border border-border bg-muted h-48 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-foreground/20" />
                      </div>
                    )}
                    {project.title && (
                      <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                    )}
                    {project.description && (
                      <p className="text-sm text-foreground/60 mb-3 leading-relaxed">{project.description}</p>
                    )}
                    {project.metrics && (
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground/50">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {project.metrics}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : null}

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div className="p-6 rounded-lg border border-border bg-card">
                <h2 className="text-2xl font-semibold mb-2">
                  Get in touch
                </h2>
                <p className="text-sm text-foreground/60 mb-6">
                  Send a message to {agency.name} to discuss your project.
                </p>
                <ContactForm agencyId={agency.id} agencyName={agency.name} />
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
                  <div className="space-y-3">
                    {agency.email && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 cursor-pointer" 
                        asChild
                      >
                        <a href={`mailto:${agency.email}`}>
                          <Mail className="h-4 w-4" />
                          Email directly
                        </a>
                      </Button>
                    )}
                    {agency.website && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2 cursor-pointer" 
                        asChild
                      >
                        <a href={agency.website} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          <Globe className="h-4 w-4" />
                          Visit website
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 cursor-pointer"
                      onClick={() => shareUrl(
                        window.location.href,
                        `${agency.name} - Marketing Agency`,
                        `Check out ${agency.name} on crewdeck.`
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      Share profile
                    </Button>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-border bg-card">
                  <h3 className="text-lg font-semibold mb-2">Response time</h3>
                  <p className="text-sm text-foreground/60">
                    {(agency as any).profile_type === "kol" ? "KOLs" : "Agencies"} typically respond within 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Reviews Section - Moved to Bottom */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 mt-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Client Reviews</h2>
              {agency.reviews > 0 && (
                <span className="text-sm text-foreground/60">
                  {agency.reviews} {agency.reviews === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {/* Review Form */}
            <div className="mb-8 p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Write a review</h3>
              <ReviewForm 
                agencyId={agency.id} 
                agencyName={agency.name}
                onSuccess={() => {
                  // Refresh the page to show new review
                  window.location.reload();
                }}
              />
            </div>

            {/* Existing Reviews */}
            {agency.reviewsList && agency.reviewsList.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
                {agency.reviewsList.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-5 rounded-lg border border-border bg-card"
                  >
                    <div className="mb-3">
                      {review.author ? (
                        <div className="font-medium text-sm mb-1">{review.author}</div>
                      ) : (
                        <div className="font-medium text-sm mb-1 text-foreground/50">Anonymous</div>
                      )}
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < review.rating
                              ? "fill-foreground/40 text-foreground/40"
                              : "fill-foreground/5 text-foreground/10"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground/70 leading-relaxed">"{review.comment}"</p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg bg-card">
                <p className="text-sm text-foreground/60">No reviews yet. Be the first to review this agency!</p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
