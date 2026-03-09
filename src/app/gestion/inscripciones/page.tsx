"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useUserContext } from "@/shared/components/providers/UserProvider";
import {
  INSCRIPCION_DOCUMENTACIONES,
  INSCRIPCION_ESTADOS,
  InscripcionesTable,
  useInscripciones,
} from "@/features/inscripciones";
import {
  getDocumentacionCursanteMeta,
  getEstadoInscripcionPrivadaMeta,
} from "@/constants/pillColor";

export default function InscripcionesPage() {
  const { user } = useUserContext();
  const searchParams = useSearchParams();
  const initialCohorteId = searchParams.get("cohorteId") ?? "";
  const [openMassAssignDialog, setOpenMassAssignDialog] = useState(false);

  const {
    rows,
    total,
    page,
    pageSize,
    loading,
    savingRowIds,
    cohortes,
    cohorteId,
    estado,
    documentacion,
    search,
    isAdmin,
    allowedInstitutosByCohorte,
    buildingMassAssign,
    savingMassAssign,
    massAssignments,
    massAssignInstitutos,
    assignedCountByInstituto,
    setPage,
    setPageSize,
    setCohorteId,
    setEstado,
    setDocumentacion,
    setSearch,
    setMassAssignments,
    handleEstadoChange,
    handleDocumentacionChange,
    handleInstitutoChange,
    buildMassAssignmentDraft,
    confirmMassAssignment,
  } = useInscripciones({
    user,
    initialCohorteId,
  });

  const handleFilterChange = (setter: (value: string) => void) => (event: SelectChangeEvent) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleOpenMassAssignment = async () => {
    const built = await buildMassAssignmentDraft();
    if (built) {
      setOpenMassAssignDialog(true);
    }
  };

  const handleConfirmMassAssignment = async () => {
    const confirmed = await confirmMassAssignment();
    if (confirmed) {
      setOpenMassAssignDialog(false);
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Inscripciones ({total})
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={handleOpenMassAssignment}
            disabled={buildingMassAssign}
          >
            {buildingMassAssign ? "Generando..." : "Asignar institutos masivamente"}
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="cohorte-filter-label">Cohorte</InputLabel>
          <Select
            labelId="cohorte-filter-label"
            label="Cohorte"
            value={cohorteId}
            onChange={handleFilterChange(setCohorteId)}
          >
            <MenuItem value="">Todas</MenuItem>
            {cohortes.map((item) => (
              <MenuItem key={item.id} value={String(item.id)}>
                {item.nombre} ({item.anio})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="estado-filter-label">Estado</InputLabel>
          <Select
            labelId="estado-filter-label"
            label="Estado"
            value={estado}
            onChange={handleFilterChange(setEstado)}
          >
            <MenuItem value="">Todos</MenuItem>
            {INSCRIPCION_ESTADOS.map((item) => (
              <MenuItem key={item} value={item}>
                {getEstadoInscripcionPrivadaMeta(item).label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="documentacion-filter-label">Documentacion</InputLabel>
          <Select
            labelId="documentacion-filter-label"
            label="Documentacion"
            value={documentacion}
            onChange={handleFilterChange(setDocumentacion)}
          >
            <MenuItem value="">Todas</MenuItem>
            {INSCRIPCION_DOCUMENTACIONES.map((item) => (
              <MenuItem key={item} value={item}>
                {getDocumentacionCursanteMeta(item).label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Buscar"
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Nombre, apellido, DNI o email"
          sx={{ minWidth: 280 }}
        />
      </Stack>

      {!cohorteId && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Selecciona una cohorte para ver las inscripciones.
          </Typography>
        </Box>
      )}

      <InscripcionesTable
        rows={rows}
        allowedInstitutosByCohorte={allowedInstitutosByCohorte}
        isAdmin={isAdmin}
        total={total}
        page={page}
        pageSize={pageSize}
        loading={loading}
        savingRowIds={savingRowIds}
        onPageChange={(nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        }}
        onEstadoChange={handleEstadoChange}
        onDocumentacionChange={handleDocumentacionChange}
        onInstitutoChange={handleInstitutoChange}
      />

      <Dialog
        open={openMassAssignDialog}
        onClose={() => setOpenMassAssignDialog(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Asignacion masiva de institutos</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Revisa la asignacion sugerida. Puedes modificar cualquier instituto antes de
              confirmar.
            </Typography>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              {massAssignInstitutos.map((instituto) => (
                <Typography key={instituto.id} variant="body2">
                  {instituto.nombre}: {assignedCountByInstituto[instituto.id] || 0}
                </Typography>
              ))}
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Apellido y nombre</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Instituto asignado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {massAssignments.map((item) => (
                  <TableRow key={item.inscriptoId}>
                    <TableCell>
                      {item.apellido}, {item.nombre}
                    </TableCell>
                    <TableCell>{item.dni}</TableCell>
                    <TableCell>
                      {item.regionId !== null && item.regionId !== undefined
                        ? `Region ${item.regionId}`
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ minWidth: 280 }}>
                      <Select
                        size="small"
                        fullWidth
                        value={item.institutoId ? String(item.institutoId) : ""}
                        onChange={(event) => {
                          const raw = event.target.value;
                          const nextId = raw === "" ? null : Number(raw);
                          setMassAssignments((prev) =>
                            prev.map((row) =>
                              row.inscriptoId === item.inscriptoId
                                ? { ...row, institutoId: nextId }
                                : row
                            )
                          );
                        }}
                      >
                        <MenuItem value="">Sin instituto</MenuItem>
                        {massAssignInstitutos.map((instituto) => (
                          <MenuItem key={instituto.id} value={String(instituto.id)}>
                            {instituto.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMassAssignDialog(false)} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmMassAssignment}
            variant="contained"
            disabled={savingMassAssign || massAssignments.length === 0}
          >
            {savingMassAssign ? "Guardando..." : "Confirmar asignacion"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
