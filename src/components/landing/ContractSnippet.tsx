const LINES = [
  "pub fn release_escrow(env: Env, escrow_id: u64) -> Result<(), Error> {",
  "    let mut escrow = load_escrow(&env, escrow_id)?;",
  "    escrow.buyer.require_auth();          // only the buyer can release",
  "    ensure_funded(&escrow)?;",
  "    token::Client::new(&env, &escrow.token)",
  "        .transfer(&env.current_contract_address(), &escrow.seller, &escrow.amount);",
  "    escrow.status = EscrowStatus::Released;",
  "    Ok(())",
  "}",
];

const TOKEN = /(\/\/.*$|\b(?:pub|fn|let|mut|Ok|Result)\b|\b(?:Env|u64|Error|EscrowStatus)\b|&|\?|"[^"]*")/g;

function highlight(line: string) {
  const parts = line.split(TOKEN).filter((p) => p !== undefined && p !== "");
  return parts.map((part, i) => {
    let cls = "text-orange-100/85";
    if (part.startsWith("//")) cls = "text-orange-300/50 italic";
    else if (/^(pub|fn|let|mut|Ok|Result)$/.test(part)) cls = "text-rose-300";
    else if (/^(Env|u64|Error|EscrowStatus)$/.test(part)) cls = "text-orange-300";
    else if (part === "&" || part === "?") cls = "text-amber-200";
    return (
      <span key={i} className={cls}>
        {part}
      </span>
    );
  });
}

/** Lines type in one after another once the surrounding Reveal becomes visible. */
export default function ContractSnippet() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0D0A09]/80 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 font-mono text-[11px] text-orange-100/50">escrow.rs — simplified</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[11.5px] leading-6 sm:text-xs">
        {LINES.map((line, i) => (
          <div key={i} className="lb-code-line whitespace-pre" style={{ animationDelay: `${250 + i * 180}ms` }}>
            <span className="mr-4 inline-block w-4 select-none text-right text-orange-100/25">{i + 1}</span>
            {highlight(line)}
          </div>
        ))}
      </pre>
    </div>
  );
}
