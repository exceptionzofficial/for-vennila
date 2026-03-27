import { useState, useEffect } from 'react';
import { Send, Trash2, ExternalLink, Link as LinkIcon, Type, History, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import loadingAnimation from './assets/loading.json';

const LoadingAnimation = () => {
  // Handle potential ESM/CJS interop issues in experimental Vite/Node environments
  const LottieComponent = (Lottie as any).default || Lottie;

  return (
    <div className="relative flex items-center justify-center" style={{ width: '180px', height: '180px' }}>
      <div className="absolute inset-0 bg-[#00b894] blur-[40px] opacity-10 animate-pulse-soft"></div>
      <div className="w-full h-full relative z-10 flex items-center justify-center">
        <LottieComponent 
          animationData={loadingAnimation}
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

interface PublishedLink {
  _id: string;
  subject: string;
  link: string;
  date: string;
}

export default function Admin() {
  const [subject, setSubject] = useState('');
  const [link, setLink] = useState('');
  const [publishedLinks, setPublishedLinks] = useState<PublishedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const startTime = Date.now();
      const res = await fetch('https://for-venilla-bend.vercel.app/api/links');
      const data = await res.json();
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      setPublishedLinks(data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !link) return;

    try {
      const res = await fetch('https://for-venilla-bend.vercel.app/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, link }),
      });
      if (res.ok) {
        setSubject('');
        setLink('');
        // Re-fetch without the long delay for better UX after action
        const refreshRes = await fetch('https://for-venilla-bend.vercel.app/api/links');
        const refreshData = await refreshRes.json();
        setPublishedLinks(refreshData);
      }
    } catch (err) {
      console.error('Failed to publish link:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`https://for-venilla-bend.vercel.app/api/links/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const refreshRes = await fetch('https://for-venilla-bend.vercel.app/api/links');
        const refreshData = await refreshRes.json();
        setPublishedLinks(refreshData);
      }
    } catch (err) {
      console.error('Failed to delete portal:', err);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div 
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <LoadingAnimation />
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container-full min-h-screen"
        >
          <header className="mb-16 flex justify-between items-end">
            <div>
              <div className="badge mb-4">
                System Administrator
              </div>
              <h1 className="header-title !mb-2 tracking-tighter">
                Control <span className="text-[#00b894]">Panel</span>
              </h1>
              <p className="text-zinc-400 font-bold uppercase tracking-[0.4em] text-[10px]">Vennila Accessories Management</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Form */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card !p-8"
              >
                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-zinc-100">
                  <PlusCircle className="text-[#00b894] w-5 h-5" />
                  <h2 className="text-lg font-black uppercase tracking-[0.2em]">Deploy Portal</h2>
                </div>
                
                <form onSubmit={handlePublish} className="space-y-8">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
                      <Type size={12} className="text-[#00b894]" /> Link Descriptor
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. TN Govt Official Portal"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
                      <LinkIcon size={12} className="text-[#00b894]" /> Destination URL
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. https://portal.tn.gov.in"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center group">
                    Deploy to Users
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </motion.div>
            </div>

            {/* Main List */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <History className="text-[#00b894] w-5 h-5" />
                  <h3 className="text-lg font-black uppercase tracking-[0.2em]">Deployment Stream</h3>
                </div>
                <div className="badge !bg-zinc-50 !text-zinc-400 !mb-0 lowercase border border-zinc-100">
                  {publishedLinks.length} active nodes
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {publishedLinks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-20 text-center card border-dashed"
                    >
                      <p className="text-zinc-300 font-bold uppercase tracking-[0.4em] text-[10px]">No active deployments found</p>
                    </motion.div>
                  ) : (
                    publishedLinks.map((item) => (
                      <motion.div 
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="card !p-6 flex flex-col justify-between group overflow-hidden"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-2 bg-zinc-50 border border-zinc-100 group-hover:border-[#00b894]/30 transition-colors">
                              <LinkIcon size={14} className="text-zinc-400 group-hover:text-[#00b894]" />
                            </div>
                            <div className="flex gap-2">
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-8 h-8 flex items-center justify-center bg-zinc-50 hover:bg-black hover:text-white transition-all"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <button 
                                onClick={() => handleDelete(item._id)}
                                className="w-8 h-8 flex items-center justify-center bg-zinc-50 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-black text-lg uppercase leading-tight mb-2 group-hover:text-[#00b894] transition-colors">{item.subject}</h4>
                          <p className="text-[9px] text-zinc-400 font-bold truncate uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded">
                            {item.link}
                          </p>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                          <div className="w-1.5 h-1.5 bg-[#00b894]/40 rounded-full"></div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
