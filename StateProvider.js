import {useContext,createContext,useReducer} from "react"

const StateContext= createContext()

const StateProvider=({reducer,initialState,children})=>{
    return(
        <StateContext.Provider value={useReducer(reducer,initialState)} className="flex-1">
            {children}
        </StateContext.Provider>
    )
}

export default StateProvider;

export const useStateValue=()=>useContext(StateContext)