import Image from "next/image";

export default function Seksjon6Tester() {
  return (
    <section
      id="tester"
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#E6F3F6] via-[#F4FBFA] to-[#F8FAFC]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">

          {/* BILDE */}
          <div className="order-1 md:order-1 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-[320px] w-[240px] rounded-full bg-[#BFE9DD] blur-3xl opacity-70" />
              <Image
                src="/tester2.png"
                alt="SmerteFri – tester for trygg progresjon i rehabilitering"
                width={200}
                height={410}
                className="relative z-10"
                priority
              />
            </div>
          </div>

          {/* TEKST */}
          <div className="order-2 md:order-2">
            <p className="mb-3 text-sm font-medium tracking-wide text-slate-500 uppercase">
              Tester
            </p>

            <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900">
              Fremgang{" "}
              <span className="text-[#007C80]">– uten prestasjonspress</span>
            </h2>

<p className="mt-6 max-w-xl text-lg text-slate-700">
  I SmerteFri brukes tester som et{" "}
  <em>verktøy for læring og trygg progresjon</em>.  
  De viser hvor kroppen er i dag, og fungerer som et felles referansepunkt –
  ikke som en prøve du må bestå.
</p>

<p className="mt-4 max-w-xl text-lg text-slate-700">
  Noen tester kan oppleves krevende, andre enkle. Resultater vil variere – og
  det er helt normalt. Poenget er ikke hvor flink du er, men å skape et
  utgangspunkt du og rehab-treneren kan bygge videre fra.
</p>

    <ul className="mt-8 space-y-4 text-slate-700">
  <li className="flex items-start gap-3">
    <span className="text-[#007C80]">✓</span>
    Tester gir et felles utgangspunkt – ikke en karakter
  </li>
  <li className="flex items-start gap-3">
    <span className="text-[#007C80]">✓</span>
    Resultater vil variere – og det er helt normalt
  </li>
  <li className="flex items-start gap-3">
    <span className="text-[#007C80]">✓</span>
    Fremgang måles over tid, ikke på én økt
  </li>
  <li className="flex items-start gap-3">
    <span className="text-[#007C80]">✓</span>
    Tester brukes når de gir mening – ikke som et krav
  </li>
</ul>

            <p className="mt-6 italic text-slate-500">
              Først lærer du kroppen å tåle. Deretter lærer du den å prestere.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}