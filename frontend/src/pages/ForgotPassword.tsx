import { Heart } from "@phosphor-icons/react";

export function ForgotPassword() {
  return (
    <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Recuperar contraseña</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Ingresa tu correo electrónico para recibir instrucciones de recuperación
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">Correo electrónico</label>
                            <input
                                type="email"
                                id="email"
                                className="mt-1 block w-full rounded-md border border-border bg-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <button
                            type="button"
                            className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Enviar instrucciones (bait, no hace nada xdxd)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </>

  );
}