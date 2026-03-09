import Inspektoeren from "./Inspektoeren";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Inspektoeren pose="thumbsup" size={40} />
            <div>
              <a href="#" className="text-xl font-bold">
                <span className="text-white">Abo</span>
                <span className="text-[#1B7A6E]">Vagt</span>
              </a>
              <p className="mt-1 text-sm">
                Halvfems Procent &middot; CVR [pending]
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm">
            <a href="#hvordan" className="hover:text-white transition-colors">
              Sådan virker det
            </a>
            <a href="#sikkerhed" className="hover:text-white transition-colors">
              Sikkerhed
            </a>
            <a href="#pris" className="hover:text-white transition-colors">
              Pris
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} AboVagt.dk. Alle rettigheder
            forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  );
}
