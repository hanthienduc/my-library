import { useContext, useEffect } from "react";
import { BookContext } from "../../context/BookContext";
import { FormInputs } from "./FormInputs";
export function AddNewBook() {

    const {resetForm } = useContext(BookContext)

    useEffect(() => {
        resetForm()
    }, [])

    return (
        <FormInputs formTitle="Add Book" submitBtnTitle="Create" isAddBook={true} />
    )
}