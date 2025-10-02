/**
 * @interface CalculateDateDto
 * Data Transfer Object for the calculate date request.
 * It provides a clean, typed structure for data passing from the interface layer
 * to the application layer.
 */
export interface CalculateDateDto {
  days?: number;
  hours?: number;
  date?: string;
}
