"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

type ConversionMode = "faithful" | "optimized";

type Metrics = {
  tokensBefore: number;
  tokensAfter: number;
  reduction: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function FileIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3.75h6.4L18.25 8.6V20.25H7V3.75Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M13.25 3.75V8.75H18.25M9.5 12h6M9.5 15.25h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.15 4.85L18 9l-4.85 1.15L12 15l-1.15-4.85L6 9l4.85-1.15L12 3ZM18.5 14l.55 2.45L21.5 17l-2.45.55L18.5 20l-.55-2.45L15.5 17l2.45-.55L18.5 14Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return <span className="check-icon" aria-hidden="true">✓</span>;
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ConversionMode>("faithful");
  const [isLight, setIsLight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  function chooseFile(nextFile: File | undefined) {
    setError("");
    setMetrics(null);
    if (!nextFile) return;
    if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Selecione um arquivo PDF.");
      return;
    }
    setFile(nextFile);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  }

  async function convertFile() {
    if (!file || isConverting) return;
    setIsConverting(true);
    setError("");
    setMetrics(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("mode", mode);
      const response = await fetch(`${API_URL}/api/v1/conversions`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Não foi possível converter o PDF.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name.replace(/\.pdf$/i, "") + ".md";
      link.click();
      URL.revokeObjectURL(downloadUrl);
      setMetrics({
        tokensBefore: Number(response.headers.get("X-SaveToken-Tokens-Before") ?? 0),
        tokensAfter: Number(response.headers.get("X-SaveToken-Tokens-After") ?? 0),
        reduction: response.headers.get("X-SaveToken-Reduction-Percentage") ?? "0",
      });
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Erro ao converter o PDF.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <main className={isLight ? "light-theme" : ""} id="inicio">
      <header className="site-header">
        <div className="brand" aria-label="SaveToken início">
          <img className="brand-mark-image" src="/savetoken-mark.png" alt="" />
          <span className="brand-copy">
            <strong>SaveToken<span className="brand-dot">.</span></strong>
            <small>
              Criado por{" "}
              <a href="https://github.com/LuisFelipeRC1" target="_blank" rel="noreferrer">
                Luis Felipe Ramalho Carvalho
              </a>
            </small>
          </span>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#converter">Recursos</a>
          <a href="#faq">Perguntas frequentes</a>
        </nav>
        <div className="header-actions">
          <button className="theme-button" aria-label="Alternar tema" onClick={() => setIsLight((value) => !value)}>
            {isLight ? "☾" : "☼"}
          </button>
          <a href="https://github.com/LuisFelipeRC1" target="_blank" rel="noreferrer" className="github-link">⌘ GitHub</a>
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> SEU CONTEÚDO, MAIS POSSIBILIDADES <b>↗</b></div>
        <h1>Seus PDFs, prontos<br />para a <em>era da IA.</em></h1>
        <p>Converta documentos PDF em Markdown de forma simples,<br className="desktop-only" /> preservando a estrutura e preparando o conteúdo para seus próximos fluxos de trabalho.</p>
        <div className="benefits">
          <span><CheckIcon /> Sem cadastro</span>
          <span><CheckIcon /> Seu conteúdo preservado</span>
          <span><CheckIcon /> Otimização opcional</span>
        </div>
        <span className="hero-sparkle"><SparkleIcon /></span>
      </section>

      <section className="converter-card" id="converter">
        <div className="card-heading">
          <div className="heading-icon"><SparkleIcon /></div>
          <div>
            <h2>Seu próximo documento começa aqui</h2>
            <p>Envie um PDF e receba um Markdown pronto para usar.</p>
          </div>
          <span className="demo-pill"><span /> Modo demonstração</span>
        </div>
        <div className="converter-body">
          <div
            className={`drop-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === "Enter") inputRef.current?.click(); }}
          >
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleInput} hidden />
            <div className="upload-icon"><FileIcon size={26} /></div>
            {file ? (
              <>
                <strong>{file.name}</strong>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar</span>
              </>
            ) : (
              <>
                <strong>Arraste seu PDF aqui</strong>
                <span>ou <u>selecione um arquivo</u> do seu computador</span>
                <small>PDF de até 10 MB</small>
              </>
            )}
          </div>
          <div className="options">
            <div className="option-label">COMO VOCÊ QUER RECEBER?</div>
            <button className={`mode-option ${mode === "faithful" ? "selected" : ""}`} onClick={() => setMode("faithful")}>
              <span className="radio" /><span><b>Conversão fiel</b><small>Preserva o Markdown original</small></span>
            </button>
            <button className={`mode-option ${mode === "optimized" ? "selected" : ""}`} onClick={() => setMode("optimized")}>
              <span className="radio" /><span><b>Otimizado para IA</b><small>Economiza tokens sem perder conteúdo</small></span><i>Recomendado</i>
            </button>
            {mode === "optimized" && (
              <div className="optimization-note">
                <SparkleIcon />
                <div>
                  <b>Menor custo para sua IA</b>
                  <p>
                    O SaveToken compara o Markdown fiel com versões estruturalmente compactadas.
                    Removemos espaçamentos redundantes, compactamos tabelas quando possível e
                    preservamos títulos, listas, links, código, fórmulas e todo o conteúdo.
                    Só usamos a versão otimizada quando ela é segura e realmente tem menos tokens.
                  </p>
                  <small>Isso reduz o tamanho do contexto enviado aos modelos, ajudando a economizar uso e deixar seus fluxos de IA mais eficientes.</small>
                </div>
              </div>
            )}
            <button className="convert-button" disabled={!file || isConverting} onClick={convertFile}>
              <SparkleIcon /> {isConverting ? "Convertendo..." : "Converter para Markdown"} <span>→</span>
            </button>
            {error && <p className="error-message">{error}</p>}
            {metrics && <p className="success-message">Download concluído · {metrics.tokensBefore.toLocaleString("pt-BR")} → {metrics.tokensAfter.toLocaleString("pt-BR")} tokens ({Number(metrics.reduction).toFixed(1)}% de redução)</p>}
          </div>
        </div>
      </section>

      <section className="lower-section" id="como-funciona">
        <div><span className="section-kicker">FEITO PARA O SEU FLUXO</span><h2>Menos fricção.<br /><em>Mais possibilidades.</em></h2></div>
        <p>Do PDF ao prompt em poucos segundos. O SaveToken transforma documentos complexos em conteúdo limpo, estruturado e pronto para trabalhar com suas ferramentas de IA favoritas.</p>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-kicker">PERGUNTAS FREQUENTES</div>
        <h2>Respostas para começar<br /><em>sem complicação.</em></h2>
        <div className="faq-list">
          <details open>
            <summary>O que é Markdown?</summary>
            <p>Markdown é um formato de texto simples que usa símbolos para representar títulos, listas, links e outros elementos. É fácil de ler, editar e utilizar em editores de notas, repositórios e ferramentas de IA.</p>
          </details>
          <details>
            <summary>Quais PDFs são aceitos?</summary>
            <p>Você envia um arquivo PDF por conversão, com no máximo 10 MiB. PDFs digitalizados, protegidos por senha ou com layouts complexos dependem dos recursos e das validações da API conectada.</p>
          </details>
          <details>
            <summary>Qual é a diferença entre os modos?</summary>
            <p>Fiel ao original preserva o conteúdo e a estrutura extraídos, sem otimizações adicionais. Otimizado para IA remove ruídos estruturais e ajusta a formatação, preservando informações relevantes. O resultado depende do processamento realizado pelo backend.</p>
          </details>
          <details>
            <summary>O SaveToken resume meus documentos?</summary>
            <p>Não. Nenhum dos modos tem como objetivo resumir documentos. A otimização organiza a estrutura e reduz ruídos, sem intenção de eliminar informações relevantes. Revise sempre o resultado, especialmente em documentos complexos.</p>
          </details>
          <details>
            <summary>Como funciona a contagem de tokens?</summary>
            <p>Tokens são unidades de texto utilizadas por modelos de IA. As estatísticas são calculadas pela API com o tokenizer configurado. Converter para Markdown não garante economia universal: diferentes tokenizers podem produzir contagens diferentes.</p>
          </details>
          <details>
            <summary>O que acontece com os arquivos enviados?</summary>
            <p>Com a API configurada, os PDFs são enviados diretamente ao backend para conversão. Armazenamento, retenção e exclusão dependem da política desse servidor; confirme essas condições antes de enviar conteúdo sensível.</p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <a className="footer-brand" href="#inicio">SaveToken<span>.</span></a>
        <p>Seu conteúdo. Novas possibilidades.<br /><small>Feito para transformar, não para resumir.</small></p>
        <span>© 2026 SaveToken</span>
      </footer>
    </main>
  );
}
