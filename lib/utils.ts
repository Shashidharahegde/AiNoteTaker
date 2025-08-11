import { clsx, type ClassValue } from "clsx"
import { error } from "console"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const handleError = (error: unknown)=>{
  if (error instanceof Error){
    return{errorMessage: error.message}
  }
  else{
    return {errorMessage: "error occurered"}
  }
}

export { handleError }