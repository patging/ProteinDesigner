import {useLocation} from "react-router-dom"

export function TempHome() {
    const location = useLocation();
    const name = location.state?.name;

    return(
        <div style = {{backgroundColor: "black", fontSize: "20px", color: "white"}}>
        <h1>Welcome To Protein Designer!</h1>
        <h2>{name}</h2>
    </div>
    )
}