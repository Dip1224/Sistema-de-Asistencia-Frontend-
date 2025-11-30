import LayoutTextFlip from "./ui/layout-text-flip.jsx";

function VerifyIntro() {
  const DEFAULT_WORDS = ["marca tu entrada", "marca tu salida", "verifica tu asistencia"];

  return (
    <header className="verify-hero">
      <p className="register-subtitle">Verificacion rapida</p>
      <div className="verify-hero__title">
        <LayoutTextFlip text="Bienvenido," words={DEFAULT_WORDS} />
      </div>
      <p className="register-description verify-hero__lead">
        Marca tu entrada y salida aqui. Coloca tu rostro frente a la camara y espera la confirmacion de asistencia.
      </p>
    </header>
  );
}

export default VerifyIntro;
