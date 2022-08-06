import { ChangeEvent, ChangeEventHandler, createContext, Dispatch, ReactNode, SetStateAction, SyntheticEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Author } from "../interfaces/Author";
import { Book } from "../interfaces/Book";
import { api_base } from "../utilities/apiUrl";
import { AuthorContext } from "./AuthorContext";

type BookContext = {
    books: Book[]
    deleteBookItem: (id: string) => void
    handleAddBook: (e: SyntheticEvent) => void
    handleUpdateBook: (e: SyntheticEvent, bookId: string) => void
    handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void
    book: Book,
    setBook: Dispatch<SetStateAction<Book>>
    handleSelect: (e: ChangeEvent<HTMLSelectElement>) => void
    authors: Author[]
    uploadImage: (e: ChangeEvent<HTMLInputElement>) => void
    image: string
    loading: boolean
    handleAreaChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
    resetForm: () => void
}

const BookContext = createContext({} as BookContext)

type BookContextProvider = {
    children: ReactNode,
}

function BookContextProvider({ children }: BookContextProvider) {

    const [books, setBooks] = useState<Book[]>([])

    const navigate = useNavigate()

    useEffect(() => {
        getBooks()
    }, [])

    const initialBookState = {
        _id: '',
        title: '',
        author: {
            _id: '',
            name: ''
        },
        publishDate: '',
        pageCount: 0,
        description: '',
        imageUrl: ''
    }

    async function getBooks() {
        try {
            const res = await fetch(`${api_base}`)
            const result = await res.json()
            setBooks(result.books)
        } catch (err) {
            console.log(err)
        }
    }

    async function deleteBookItem(id: string) {
        if (id !== undefined) {
            const data = await fetch(`${api_base}books/delete/${id}`,
                { method: 'DELETE' }).then(res => res.json())
            setBooks(book => book.filter(book => book._id !== data.bookId))
            navigate(`/books`, { replace: true })
        }
    }

    const { authors } = useContext(AuthorContext)
    const [apiKey, setApiKey] = useState('')

    const [book, setBook] = useState<Book>(initialBookState)

    const [image, setImage] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setBook(prevBook => {
            return {
                ...prevBook,
                author: authors[0]
            }
        })
        getApiKey()
    }, [])

    const getApiKey = async () => {
        const result = await fetch(`${api_base}imgur_api_key`)
        const data = await result.json()
        setApiKey(data.apiKey)
    }

    const handleSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value: authorName } = e.currentTarget
        const author = authors.find(author => author.name === authorName) || authors[0]
        setBook((prevBook) => {
            return {
                ...prevBook,
                author: author
            }
        })
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.currentTarget
        setBook((prevBook) => {
            return {
                ...prevBook,
                [name]: value
            }
        })
    }

    const handleAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.currentTarget
        setBook((prevBook) => {
            return {
                ...prevBook,
                [name]: value
            }
        })
    }

    const handleAddBook = async (e: SyntheticEvent) => {
        e.preventDefault()

        const result = await fetch(`${api_base}books/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: book.title,
                author: book.author._id,
                publishDate: book.publishDate,
                pageCount: book.pageCount,
                description: book.description,
                imageUrl: image
            })
        }).then(res => res.json())
        getBooks()
        setBook(initialBookState)
        navigate(`/books/${result.bookId}`, { replace: true })
    }

    const resetForm = () => {
        setBook(initialBookState)
    }

    const handleUpdateBook = async (e: SyntheticEvent, bookId: string) => {
        e.preventDefault()

        const result = await fetch(`${api_base}books/update/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: book.title,
                author: book.author._id,
                publishDate: book.publishDate,
                pageCount: book.pageCount,
                description: book.description,
                imageUrl: image
            })
        }).then(res => res.json())
        getBooks()
        setBook(initialBookState)
        
        navigate(`/books/${result.bookId}`, { replace: true })
    }

    const uploadImage: ChangeEventHandler<HTMLInputElement> = async (e) => {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Client-ID ${apiKey}`);
        console.log(apiKey)
        const files = e.target.files
        const formdata = new FormData()
        if (files) {
            formdata.append('image', files[0])
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: formdata,
        };
        setLoading(true)
        const res = await fetch('https://api.imgur.com/3/image', requestOptions)
        const file = await res.json()

        setImage(file.data.link)
        console.log(file.data)
        setLoading(false)
    }

    return (
        <BookContext.Provider value={{
            books, deleteBookItem, handleAddBook,
            handleUpdateBook,
            handleInputChange,
            book,
            setBook,
            handleSelect,
            authors,
            uploadImage,
            image,
            loading,
            handleAreaChange,
            resetForm
        }}>
            {children}
        </BookContext.Provider>
    )
}

export { BookContextProvider, BookContext }