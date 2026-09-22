import React from "react";

interface HeaderProps {
  sectionNumber?: string;
  sectionTitle?: string;
}

export const CtasHeader: React.FC<HeaderProps> = ({ sectionNumber, sectionTitle }) => {
  return (
    <div className="w-full pb-3 border-b border-slate-700/80 flex items-center justify-between mb-5">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded bg-[#134456] flex items-center justify-center text-white font-bold text-xs shadow-xs">
          ctas.
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-tight text-slate-800">ctas.</span>
          <span className="text-[7px] uppercase tracking-widest text-slate-500 font-medium -mt-0.5">
            CONSULTORIA & PESQUISA
          </span>
        </div>
      </div>

      {/* Section Code & Title */}
      {sectionTitle && (
        <div className="text-[9px] uppercase tracking-widest font-semibold text-slate-600 font-mono">
          {sectionNumber ? `${sectionNumber} · ` : ""}
          {sectionTitle}
        </div>
      )}
    </div>
  );
};

interface FooterProps {
  pageNumber: number;
}

export const CtasFooter: React.FC<FooterProps> = ({ pageNumber }) => {
  const formattedPage = pageNumber < 10 ? `0${pageNumber}` : `${pageNumber}`;
  return (
    <div className="w-full pt-3 mt-auto border-t border-slate-200/80 flex items-center justify-between text-[8px] text-slate-400 font-sans">
      <div>
        CTAS Consultoria & Pesquisa — Tracking Eleitoral Grande Aracaju — Onda 1
      </div>
      <div className="font-mono font-medium text-slate-500">
        Página {formattedPage}
      </div>
    </div>
  );
};
