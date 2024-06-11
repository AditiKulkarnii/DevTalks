import { useState } from "react"

const InputBox = ({name, type, id, value, placeholder,icon, disable = false  }) =>{
    const [passwordVisible, setPasswordVisible] = useState(false)
    return(
        <div className="relative w-[100%] mb-4 border-b border-grey box-shadow-xl">
            <input name={name}
                type={type === "password" ? passwordVisible ? "text" : "password" : type}
                placeholder={placeholder}
                defaultValue={value}
                id={id}
                disabled={disable}
                className="input-box outline:none focus:outline-none shadow-xl"
            />
            <i className={"fa "+ icon + " input-icon"}></i>
            {
                type === "password" ?
                <i className={"fi fi-rr-eye" +(!passwordVisible ? "-crossed" : "") +" input-icon left-[auto] right-4 cursor-pointer"} onClick={()=>setPasswordVisible(currVal=>!currVal)}></i>
                : ""
            }
        </div>
    )
}
export default InputBox