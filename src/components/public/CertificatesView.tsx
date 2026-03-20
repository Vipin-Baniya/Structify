"use client";
import { useEffect, useState } from "react";
import { Certificate } from "@/types";
import { Award, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const CAT_COLOR: Record<string, string> = {
  programming: "bg-blue-500/20 text-blue-400",
  ai:          "bg-purple-500/20 text-purple-400",
  cloud:       "bg-cyan-500/20 text-cyan-400",
  systems:     "bg-orange-500/20 text-orange-400",
  design:      "bg-pink-500/20 text-pink-400",
  other:       "bg-gray-500/20 text-gray-400",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function CertificatesView() {
  const [items, setItems] = useState<Certificate[]>([]);

  useEffect(() => {
    fetch("/api/certificates").then(r => r.json()).then(d => Array.isArray(d) && setItems(d));
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-3xl font-black text-text mb-1">Certificates</h1>
        <p className="text-muted text-sm mb-6">Verified skills and completed programs.</p>
      </motion.div>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-dim text-sm">No certificates yet. Add one in the admin panel.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {items.map(c => (
            <motion.div
              key={c._id}
              variants={cardVariant}
              className="card-hover bg-card border border-border rounded-xl overflow-hidden hover:border-green/30"
            >
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-green/5 to-transparent flex items-center justify-center">
                  <Award size={32} className="text-green/20" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-text text-sm">{c.title}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${CAT_COLOR[c.category]}`}>
                    {c.category}
                  </span>
                </div>
                {c.issuer && <p className="text-muted text-xs mb-2">{c.issuer}</p>}
                {c.skills.length > 0 && (
                   <div className="flex flex-wrap gap-1 mb-3">
                     {c.skills.slice(0, 3).map(s => (
                       <span key={s} className="tech-badge font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border/50 hover:border-green/30 hover:text-green">{s}</span>
                     ))}
                   </div>
                 )}
                <div className="flex gap-2">
                  {c.verificationUrl && (
                    <a href={c.verificationUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-green flex items-center gap-1 hover:underline font-mono">
                      Verify <ExternalLink size={10} />
                    </a>
                  )}
                  {c.pdfUrl && (
                    <a href={c.pdfUrl} target="_blank" rel="noreferrer"
                      className="text-xs text-muted flex items-center gap-1 hover:text-text font-mono">
                      PDF <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
