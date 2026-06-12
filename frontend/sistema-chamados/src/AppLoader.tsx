import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5077/api'
const IS_RENDER = import.meta.env.VITE_ENVIRONMENT == "Render"


function AppLoader({children} : {children: React.ReactNode}){
    const [isReady, setIsReady] = useState(false);
    const [_isWakingUp, setIsWakingUp] = useState(false);
    const [message, setMessage] = useState("Checando conexão com o servidor...");

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const checkServer = async () => {
            try {
                const res = await fetch(`${API_URL}/general/health`)

                if (res.ok){
                    setIsReady(true);
                    clearInterval(interval);
                }
            }
            catch{

            }
        }

        const timer = setTimeout(() => {
            setIsWakingUp(true);
            if (IS_RENDER) setMessage("O plano gratuito do Render pode levar até 1 minuto para inicializar o servidor, por favor aguarde.")
        }, 3000)

        interval = setInterval(checkServer, 3000);

        checkServer();

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    
    return (
        <>
        {isReady ? children : <div className="th-loader flex column">
            <img style={{marginBottom:"50px"}} src="https://raw.githubusercontent.com/n3r4zzurr0/svg-spinners/main/preview/ring-resize-white-36.svg"/>
             <p>{message}</p>
            {IS_RENDER && <img className="whitetint render-logo" src="/render-seeklogo.png"/>}
            </div>}
        </>
    )
}

export default AppLoader;