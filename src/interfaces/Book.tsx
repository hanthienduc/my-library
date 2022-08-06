import { Author } from "./Author"

export interface Book {
    _id: string,
    title: string,
    description: string,
    publishDate: string,
    pageCount: number,
    imageUrl: string
    author: Author 
}