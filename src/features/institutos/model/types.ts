export interface Instituto {
  id: number;
  nombre: string;
  distritoNombre: string | null;
  regionId: number | null;
}

export interface EditableInstituto extends Instituto {
  distritoId?: number | null;
}

export interface Distrito {
  id: number;
  nombre: string;
  regionId: number;
}
