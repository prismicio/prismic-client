import { Document } from "./documents";
export default interface ApiSearchResponse {
    page: number;
    results_per_page: number;
    results_size: number;
    total_results_size: number;
    total_pages: number;
    next_page: string;
    prev_page: string;
    results: Document[];
}
