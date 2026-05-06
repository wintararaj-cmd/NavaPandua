import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { schoolService } from "../services/api";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, GraduationCap, Target, Rocket, ArrowRight, Star, Users, BookOpen, Award, CheckCircle2, X, Globe, Calendar, Shield, ChevronRight, Menu } from "lucide-react";

const fadeUp = { hidden:{opacity:0,y:30}, show:{opacity:1,y:0,transition:{duration:0.6}} };

export default function SchoolPage() {
  const { schoolCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    schoolService.getPublicPage(schoolCode).then(setData).catch(()=>setError("School not found.")).finally(()=>setLoading(false));
    return () => window.removeEventListener("scroll", onScroll);
  }, [schoolCode]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#050a18"}}>
      <div className="text-center">
        <motion.div animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:"linear"}} className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4" style={{borderColor:"#6366f1 transparent #6366f1 #6366f1"}}/>
        <p className="text-white/50 text-sm font-medium tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );

  if (error||!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6"><X className="text-red-500" size={32}/></div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Not Found</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/" className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">Go Home</Link>
      </div>
    </div>
  );

  const pc = data.primary_color || "#6366f1";
  const heroImage = data.gallery_images?.[0]?.image;

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        .pc{color:${pc}}
        .bg-pc{background-color:${pc}}
        .hero-bg{background:linear-gradient(135deg,#050a18 0%,#0d1b3e 50%,#0a0f2c 100%)}
        .glass{background:rgba(255,255,255,0.07);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.12)}
        .card-hover{transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}.card-hover:hover{transform:translateY(-8px);box-shadow:0 32px 64px -16px rgba(0,0,0,0.15)}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}.float{animation:float 6s ease-in-out infinite}
        @keyframes pglow{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}.glow{animation:pglow 4s ease-in-out infinite}
        .text-shadow{text-shadow: 0 4px 12px rgba(0,0,0,0.5)}
      `}</style>

      {/* NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled?"bg-white/95 backdrop-blur-xl shadow-lg py-3":"py-6 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {data.school_logo ? (
               <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl overflow-hidden shrink-0">
                  <img src={data.school_logo} alt="Logo" className="max-h-full max-w-full object-contain" />
               </div>
            ) : (
               <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white bg-pc shrink-0">
                  <GraduationCap size={22}/>
               </div>
            )}
            <span className={`font-black text-xl tracking-tight truncate ${scrolled?"text-gray-900":"text-white"}`}>{(data.school_name||"").split(" ")[0]}<span className="pc">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["About","Vision","Gallery","Contact"].map(n=><a key={n} href={`#${n.toLowerCase()}`} className={`text-xs font-black uppercase tracking-widest transition-all ${scrolled?"text-gray-500 hover:text-gray-900":"text-white/70 hover:text-white"}`}>{n}</a>)}
            <Link to={`/admission?school=${schoolCode}`} className="text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 hover:scale-105 transition-all active:scale-95 shadow-lg" style={{background:pc}}>Enroll Now</Link>
          </div>
          <button onClick={()=>setMenuOpen(!menuOpen)} className={`md:hidden p-2 rounded-lg ${scrolled?"text-gray-900":"text-white"}`}>
            {menuOpen?<X size={24}/>:<Menu size={24}/>}
          </button>
        </div>
        {menuOpen&&<div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {["About","Vision","Gallery","Contact"].map(n=><a key={n} href={`#${n.toLowerCase()}`} onClick={()=>setMenuOpen(false)} className="block text-sm font-bold text-gray-700 py-2">{n}</a>)}
          <Link to={`/admission?school=${schoolCode}`} className="block w-full text-center text-white py-3 rounded-xl font-bold" style={{background:pc}}>Enroll Now</Link>
        </div>}
      </nav>

      {/* HERO */}
      <header className="min-h-[90vh] flex items-center pt-24 pb-16 relative overflow-hidden hero-bg">
        {heroImage && (
            <div className="absolute inset-0 z-0 opacity-20">
                <img src={heroImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050a18] via-[#050a18]/80 to-transparent"></div>
            </div>
        )}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="glow absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full blur-[100px]" style={{background:`${pc}30`}}/>
          <div className="glow absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[80px]" style={{background:`${pc}20`}}/>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/80 text-xs font-black tracking-widest uppercase mb-6">
              <span className="h-2 w-2 rounded-full animate-pulse" style={{backgroundColor:pc}}/>
              {data.school_institution_type?.replace(/_/g," ")||"Educational Institute"}
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-4 text-shadow">
              {data.school_name||"Our School"}
            </h1>
            
            {data.school_slogan && (
              <p className="text-transparent bg-clip-text text-xl md:text-2xl font-bold mb-6 italic" style={{backgroundImage:`linear-gradient(135deg,${pc},#818cf8)`}}>
                "{data.school_slogan}"
              </p>
            )}
            
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              Welcome to <strong className="text-white">{data.school_name}</strong>. Where tradition meets innovation to create a world-class learning experience.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to={`/admission?school=${schoolCode}`} className="text-white px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 hover:-translate-y-1 transition-all flex items-center gap-2 shadow-xl active:scale-95" style={{background:pc}}>
                Start Admission <ArrowRight size={18}/>
              </Link>
              <a href="#about" className="glass text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/15 transition-all">
                Explore Story
              </a>
            </div>
            
            <div className="flex flex-wrap gap-10 border-t border-white/20 pt-8">
              {[
                {label:"Students",value:data.school_total_students>0?`${data.school_total_students}+`:"500+"},
                {label:"Teachers",value:data.school_total_teachers>0?`${data.school_total_teachers}+`:"50+"},
                {label:"Est.",value:data.school_established_year||"-"},
              ].map((s,i)=>(
                <div key={i}>
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-white/50 text-xs font-black uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.3,duration:0.8}} className="hidden lg:block float">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[60px] blur-2xl opacity-30" style={{background:pc}}/>
              <div className="relative glass rounded-[40px] p-3 overflow-hidden shadow-2xl">
                {heroImage ? (
                  <img src={heroImage} alt="School" className="w-full h-auto rounded-[32px] object-cover aspect-[4/5]"/>
                ) : (
                  <div className="w-full aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5 rounded-[32px] flex items-center justify-center">
                    <GraduationCap size={120} className="text-white/20" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* STATS */}
      <section className="py-24 bg-white relative z-20 -mt-10 rounded-t-[60px] shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: data.school_mission || "To provide holistic education that empowers students to lead and innovate." },
              { icon: Star, title: "Our Vision", desc: data.school_vision || "To be a global benchmark in academic excellence and character building." },
              { icon: Award, title: "Excellence", desc: "Recognized for consistent academic performance and extracurricular leadership." }
            ].map((item, idx) => (
              <div key={idx} className="p-10 rounded-[40px] bg-gray-50 border border-gray-100 card-hover group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-white shadow-sm group-hover:shadow-md transition-all" style={{color:pc}}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{background:pc}}/>
              <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
                 {heroImage ? (
                    <img src={heroImage} alt="Campus" className="w-full h-auto" />
                 ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center"><BookOpen size={64} className="text-gray-300"/></div>
                 )}
              </div>
            </div>
            <div>
              <span className="font-black tracking-widest uppercase text-sm block mb-4" style={{color:pc}}>Our Story</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8">Nurturing Minds, <br/><span style={{color:pc}}>Defining Futures.</span></h2>
              <div className="space-y-6 text-gray-500 text-lg leading-relaxed">
                <p>{data.school_about || "Founded with a vision to revolutionize learning, we combine traditional values with modern technology. Our campus provides a sanctuary for intellectual growth and creative expression."}</p>
                <div className="grid sm:grid-cols-2 gap-4 pt-6">
                  {["Expert Faculty", "Modern Labs", "Sports Academy", "Digital Classrooms"].map(f=>(
                    <div key={f} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`${pc}15`, color:pc}}><CheckCircle2 size={14}/></div>
                      <span className="text-sm font-bold text-gray-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      {data.gallery_images?.length > 0 && (
        <section id="gallery" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center mb-16">
            <span className="font-black tracking-widest uppercase text-sm block mb-4" style={{color:pc}}>Campus Life</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Life at <span style={{color:pc}}>Campus</span></h2>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {data.gallery_images.map((img, idx) => (
                <motion.div key={idx} whileHover={{y:-5}} className="relative group rounded-3xl overflow-hidden shadow-lg">
                  <img src={img.image} alt={img.caption} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRINCIPAL */}
      {data.school_principal_name&&(
        <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute top-0 right-0 w-[50%] h-full rounded-full blur-[120px] opacity-10" style={{background:pc}}/></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{background:`${pc}30`}}><GraduationCap size={36} style={{color:pc}}/></div>
            <blockquote className="text-2xl md:text-3xl font-bold text-white/90 leading-relaxed mb-8 italic">"Education is not the filling of a pail, but the lighting of a fire."</blockquote>
            <p className="font-black text-xl" style={{color:pc}}>{data.school_principal_name}</p>
            <p className="text-white/50 text-sm mt-1 uppercase tracking-wider font-bold">Principal, {data.school_name}</p>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="font-black tracking-widest uppercase text-sm block mb-4" style={{color:pc}}>Get In Touch</span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">Start Your <span style={{color:pc}}>Journey</span></h2>
              <p className="text-gray-500 text-lg mb-10">Have questions about admissions? Our team is ready to help.</p>
              <div className="space-y-6 mb-10">
                {[
                  {icon:MapPin,label:"Address",val:data.school_address},
                  {icon:Mail,label:"Email",val:data.school_email},
                  {icon:Phone,label:"Phone",val:data.school_phone},
                ].map((c,i)=>c.val&&(
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white border border-gray-100" style={{color:pc}}><c.icon size={20}/></div>
                    <div className="pt-1"><p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{c.label}</p><p className="font-bold text-gray-800">{c.val}</p></div>
                  </div>
                ))}
              </div>
              {data.school_website&&<a href={data.school_website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all" style={{color:pc}}><Globe size={18}/> Visit Official Website <ChevronRight size={16}/></a>}
            </div>
            
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
              <h3 className="text-2xl font-black text-gray-900 mb-8">Send an Inquiry</h3>
              <form className="space-y-5" onSubmit={e=>e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" placeholder="Your name" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all" onFocus={e=>e.target.style.boxShadow=`0 0 0 2px ${pc}30`} onBlur={e=>e.target.style.boxShadow="none"}/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Email</label>
                    <input type="email" placeholder="your@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all" onFocus={e=>e.target.style.boxShadow=`0 0 0 2px ${pc}30`} onBlur={e=>e.target.style.boxShadow="none"}/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                  <input type="tel" placeholder="+91 00000 00000" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all" onFocus={e=>e.target.style.boxShadow=`0 0 0 2px ${pc}30`} onBlur={e=>e.target.style.boxShadow="none"}/>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea rows={4} placeholder="Tell us about your interest..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-900 font-medium resize-none focus:outline-none focus:ring-2 focus:bg-white transition-all" onFocus={e=>e.target.style.boxShadow=`0 0 0 2px ${pc}30`} onBlur={e=>e.target.style.boxShadow="none"}/>
                </div>
                <button type="submit" className="w-full text-white py-4 rounded-xl font-black text-base hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2" style={{background:pc}}>
                  Send Message <Rocket size={18}/>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050a18] text-white/80 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3">
              {data.school_logo ? (
                <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg overflow-hidden shrink-0">
                  <img src={data.school_logo} alt="Logo" className="max-h-full max-w-full object-contain p-1"/>
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white" style={{background:pc}}><GraduationCap size={22}/></div>
              )}
              <span className="font-black text-xl tracking-tight text-white">{data.school_name}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {["Privacy Policy","Terms of Service","Contact Us"].map(l=><a key={l} href="#" className="text-white/60 text-sm font-bold hover:text-white transition-colors">{l}</a>)}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-widest uppercase text-white/40">
            <p>&copy; {new Date().getFullYear()} {data.school_name}. All rights reserved.</p>
            <p>Powered by <span className="text-white/60">School Management System</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
