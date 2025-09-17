import { useState } from "react";
import axios from "axios";
import type { Certificado } from "../types/Certificado";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { motion } from "framer-motion";
//import { API_URL } from "../config/api";
import API_URL from "../config";

export default function BuscarCertificados() {
  const [nombre, setNombre] = useState("");
  const [resultados, setResultados] = useState<Certificado[]>([]);
  const [mostrar, setMostrar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirmarCancelar, setModalConfirmarCancelar] = useState<
    null | "cancelar"
  >(null);
  const [certificadoEditar, setCertificadoEditar] =
    useState<Certificado | null>(null);

  const buscar = async () => {
    setSearchTerm(nombre);
    if (!nombre.trim()) {
      setError("Por favor, ingresa un nombre antes de buscar.");
      setMostrar(false); // oculta la tabla si estaba visible
      setResultados([]); // limpia los resultados
      return;
    }
    setError("");

    try {
      const params: Record<string, string> = {};
      if (nombre.trim()) params.nombre = nombre.trim();

      const { data } = await axios.get<Certificado[]>(
        `${API_URL}/api/certificados_bautismo/buscar`,
        { params }
      );
      setResultados(data);
      setMostrar(true);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      setResultados([]);
      setError("Ocurrió un error en la búsqueda.");
    }
    /* try {
      const data = await window.bautismoAPI.buscar(nombre.trim());
      if (Array.isArray(data)) {
        setResultados(data);
        setMostrar(true);
      } else {
        setResultados([]);
        setMostrar(true);
      } */
  };

  // Función para descargar un certificado en PDF
  const descargarCertificado = async (id: number | string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/certificados_bautismo/${id}/pdf`,
        {
          responseType: "blob", // recibimos el archivo binario
        }
      );
      /* try {
      const buffer = await window.bautismoAPI.descargarCertificado(Number(id));
      const uint8Array = new Uint8Array(buffer);
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob); */
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificado_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error descargando certificado:", error);
    }
  };

  // Función para confirmar acción
  const confirmarCancelar = () => {
    if (modalConfirmarCancelar === "cancelar") {
      setModalEditar(false); // Cierra el modal de edición
    }
    setModalConfirmarCancelar(null); // Cierra el modal de confirmación
  };

  // Abrir modal de confirmación
  const abrirModal = (id: number) => {
    setIdSeleccionado(id);
    setModalVisible(true);
  };

  const confirmarEliminar = async () => {
    if (idSeleccionado === null) return;
    try {
      await axios.delete(
        `${API_URL}/api/certificados_bautismo/${idSeleccionado}`
      );
      /*  try {
      await window.bautismoAPI.eliminarCertificado(idSeleccionado); */

      setResultados(resultados.filter((item) => item.id !== idSeleccionado));
      setModalVisible(false);
      setIdSeleccionado(null);
      setMostrarMensaje("Certificado eliminado correctamente.");
      setTimeout(() => {
        setMostrarMensaje("");
      }, 3000);
    } catch (error) {
      setMensajeError("Ocurrió un error al eliminar el certificado.");
      setTimeout(() => {
        setMensajeError("");
      }, 3000);
      console.error("Error al eliminar:", error);
    }
  };

  const obtenerTodos = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(
        `${API_URL}/api/certificados_bautismo/all`
      );
      /* try {
      setCargando(true);
      const data = await window.bautismoAPI.obtenerTodos(); */
      setResultados(data);
      setMostrar(true);
    } catch (err) {
      console.error("❌ Error cargando bautizos:", err);
    } finally {
      setCargando(false);
    }
  };

  // Abrir modal para editar
  const abrirModalEditar = (certificado: Certificado) => {
    setCertificadoEditar({ ...certificado }); // clonar datos
    setModalEditar(true);
  };

  // Manejar cambios en el formulario de edición
  const manejarCambioEditar = (campo: keyof Certificado, valor: string) => {
    if (!certificadoEditar) return;
    setCertificadoEditar({ ...certificadoEditar, [campo]: valor });
  };

  // Guardar cambios en el backend
  const guardarEdicion = async () => {
    if (!certificadoEditar) return;
    try {
      await axios.put(
        `${API_URL}/api/certificados_bautismo/${certificadoEditar.id}`,
        certificadoEditar
      );
      /* try {
      await window.bautismoAPI.actualizarBautismo(
        certificadoEditar.id,
        certificadoEditar
      ); */

      // Actualizar en el estado local
      setResultados((prev) =>
        prev.map((item) =>
          item.id === certificadoEditar.id ? certificadoEditar : item
        )
      );

      setModalEditar(false);
      setCertificadoEditar(null);
      setMostrarMensaje("Cambios guardados correctamente.");
      setTimeout(() => {
        setMostrarMensaje("");
      }, 3000);
    } catch (err) {
      setMensajeError("Ocurrió un error al guardar los cambios.");
      setTimeout(() => {
        setMensajeError("");
      }, 3000);
      console.error("Error actualizando certificado:", err);
    }
  };

  return (
    <div className="w-full p-6 flex flex-col items-center justify-start">
      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg w-full max-w-6xl">
        <label className="text-blue-900 font-semibold text-2xl block mb-4">
          Nombre de la persona Bautizada
        </label>
        <Input
          type="text"
          placeholder="Escriba el nombre aquí"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              buscar();
            }
          }}
          className="w-full bg-white text-xl p-3 mb-4 border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        {error && (
          <div className="mb-4 text-center">
            <div className="bg-yellow-100 border border-yellow-400 text-black text-xl px-4 py-3 rounded relative shadow-md animate-fadeIn">
              <strong className="font-bold">
                {"\u{26A0}\u{FE0F}"} Atención:{" "}
              </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="buscar" onClick={buscar}>
            {"\u{1F50D}"} Buscar
          </Button>

          <Button variant="cargar" onClick={obtenerTodos}>
            {"\u{1F4C1}"} Cargar Todos
          </Button>
        </div>

        {/* Loader */}
        {cargando && <p className="mt-4 text-gray-500">Cargando...</p>}

        {mostrar && (
          <div className="overflow-x-auto transition-all duration-300">
            {resultados.length > 0 ? (
              <table className="w-full border border-gray-300 rounded-lg font-semibold text-center">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-gray-300 p-2">
                      Nombre Completo
                    </th>
                    <th className="border border-gray-300 p-2">
                      Fecha Bautismo
                    </th>
                    <th className="border border-gray-300 p-2">Libro</th>
                    <th className="border border-gray-300 p-2">Folio</th>
                    <th className="border border-gray-300 p-2">No. Archivo</th>
                    <th className="border border-gray-300 p-2">
                      Doc. en Base de Datos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <td className="border border-gray-300 p-2 text-[18px] text-left">
                        {item.nombreBautizado}
                      </td>
                      <td className="border border-gray-300 p-2 text-[18px]">
                        {item.diaBautismo}/{item.mesBautismo}/{item.anoBautismo}
                      </td>
                      <td className="border border-gray-300 p-2 text-[18px]">
                        {item.libroBautizo}
                      </td>
                      <td className="border border-gray-300 p-2 text-[18px]">
                        {item.folioBautizo}
                      </td>
                      <td className="border border-gray-300 p-2 text-[18px]">
                        {item.numeroArchivo}
                      </td>
                      <td className="border border-gray-300 p-2 flex gap-2 justify-center text-[18px]">
                        <Button
                          variant="descargaBusqueda"
                          onClick={() => descargarCertificado(item.id)}
                        >
                          {"\u{2B07}\u{FE0F}"} Descargar
                        </Button>
                        <Button
                          variant="eliminarBusqueda"
                          onClick={() => abrirModal(item.id)}
                        >
                          {"\u{1F5D1}\u{FE0F}"} Eliminar
                        </Button>

                        <Button
                          variant="editarBusqueda"
                          onClick={() => abrirModalEditar(item)}
                        >
                          {"\u{270F}\u{FE0F}"} Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <motion.div
                key={searchTerm} // solo reinicia cuando cambia el término buscado
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                //className="mt-6 text-center"
              >
                <div className="text-center">
                  <div className="bg-red-100 border border-red-400 text-black text-xl px-4 py-3 rounded relative shadow-md animate-fadeIn">
                    <strong className="font-bold">{"\u{1F6AB}"} Error: </strong>
                    <span className="block sm:inline">
                      El nombre buscado no está registrado.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {mostrarMensaje && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <p className="text-lg font-medium">{mostrarMensaje}</p>
          </div>
        </div>
      )}

      {mensajeError && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <p className="text-lg font-medium">{mensajeError}</p>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <p className="text-lg font-semibold text-center mb-4">
              ¿Estás seguro de eliminar este certificado?
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="eliminarModal" onClick={confirmarEliminar}>
                Sí
              </Button>
              <Button
                variant="conservarModal"
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de edición */}
      {modalEditar && certificadoEditar && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl h-150 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Editar Certificado
            </h2>

            {/* Campos editables */}
            <div className="space-y-3">
              <Input
                label="Nombre del que Suscribe"
                type="text"
                value={certificadoEditar.nombreSuscribe}
                onChange={(e) =>
                  manejarCambioEditar("nombreSuscribe", e.target.value)
                }
                className="w-full border p-2 rounded"
                placeholder="Nombre completo"
              />
              <div className="flex gap-2">
                <Input
                  label="Libro de Bautizo"
                  type="text"
                  value={certificadoEditar.libroBautizo ?? ""}
                  onChange={(e) =>
                    manejarCambioEditar("libroBautizo", e.target.value)
                  }
                  className="w-1/3 border p-2 rounded"
                  placeholder="Libro"
                />
                <Input
                  label="Folio de Bautizo"
                  type="text"
                  value={certificadoEditar.folioBautizo ?? ""}
                  onChange={(e) =>
                    manejarCambioEditar("folioBautizo", e.target.value)
                  }
                  className="w-1/3 border p-2 rounded"
                  placeholder="Folio"
                />
                <Input
                  label="Número de Archivo P."
                  type="text"
                  value={certificadoEditar.numeroArchivo ?? ""}
                  onChange={(e) =>
                    manejarCambioEditar("numeroArchivo", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Número de archivo"
                />
              </div>
              <div className="space-y-3">
                <Input
                  label="Nombre de la persona a Bautizar"
                  type="text"
                  value={certificadoEditar.nombreBautizado}
                  onChange={(e) =>
                    manejarCambioEditar("nombreBautizado", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre completo"
                />
                <div className="flex gap-2">
                  <Input
                    label="Día de Nacimiento"
                    type="text"
                    value={certificadoEditar.diaNacimiento ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("diaNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Día Nacimiento"
                  />
                  <Input
                    label="Mes de Nacimiento"
                    type="text"
                    value={certificadoEditar.mesNacimiento}
                    onChange={(e) =>
                      manejarCambioEditar("mesNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Mes: Ej. Enero"
                  />
                  <Input
                    label="Año de Nacimiento"
                    type="text"
                    value={certificadoEditar.anoNacimiento ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("anoNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Año Nacimiento"
                  />
                </div>
                <Input
                  label="Lugar de Nacimiento"
                  type="text"
                  value={certificadoEditar.lugarNacimiento}
                  onChange={(e) =>
                    manejarCambioEditar("lugarNacimiento", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Lugar de Nacimiento"
                />
                <Input
                  label="Nombre del Padre"
                  type="text"
                  value={certificadoEditar.nombrePadre}
                  onChange={(e) =>
                    manejarCambioEditar("nombrePadre", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre del Padre"
                />
                <Input
                  label="Nombre de la Madre"
                  type="text"
                  value={certificadoEditar.nombreMadre}
                  onChange={(e) =>
                    manejarCambioEditar("nombreMadre", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre de la Madre"
                />
                <div className="flex gap-2">
                  <Input
                    label="Libro de Nacimiento"
                    type="text"
                    value={certificadoEditar.libroNacimiento ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("libroNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Libro Nacimiento"
                  />
                  <Input
                    label="Folio de Nacimiento"
                    type="text"
                    value={certificadoEditar.folioNacimiento ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("folioNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Folio Nacimiento"
                  />
                  <Input
                    label="Archivo de Nacimiento"
                    type="text"
                    value={certificadoEditar.archivoNacimiento ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("archivoNacimiento", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Archivo Nacimiento"
                  />
                </div>
                <Input
                  label="Año de Archivo"
                  type="text"
                  value={certificadoEditar.anoArchivo ?? ""}
                  onChange={(e) =>
                    manejarCambioEditar("anoArchivo", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Año de Archivo"
                />
                <Input
                  label="Oficialía"
                  type="text"
                  value={certificadoEditar.oficialia}
                  onChange={(e) =>
                    manejarCambioEditar("oficialia", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Oficialía"
                />
                <div className="flex gap-2">
                  <Input
                    label="Día de Bautismo"
                    type="text"
                    value={certificadoEditar.diaBautismo ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("diaBautismo", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Día Bautismo"
                  />
                  <Input
                    label="Mes de Bautismo"
                    type="text"
                    value={certificadoEditar.mesBautismo}
                    onChange={(e) =>
                      manejarCambioEditar("mesBautismo", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Mes: Ej. Enero"
                  />
                  <Input
                    label="Año de Bautismo"
                    type="text"
                    value={certificadoEditar.anoBautismo ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("anoBautismo", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Año Bautismo"
                  />
                </div>
                <Input
                  label="Padrino"
                  type="text"
                  value={certificadoEditar.padrino}
                  onChange={(e) =>
                    manejarCambioEditar("padrino", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre del Padrino"
                />
                <Input
                  label="Madrina"
                  type="text"
                  value={certificadoEditar.madrina}
                  onChange={(e) =>
                    manejarCambioEditar("madrina", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre de la Madrina"
                />
                <Input
                  label="Ministro del Sacramento"
                  type="text"
                  value={certificadoEditar.ministroSacramento}
                  onChange={(e) =>
                    manejarCambioEditar("ministroSacramento", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Nombre del Ministro"
                />
                <Input
                  label="Notas Marginales"
                  type="text"
                  value={certificadoEditar.notasMarginales}
                  onChange={(e) =>
                    manejarCambioEditar("notasMarginales", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  placeholder="Notas Marginales"
                />
                <div className="flex gap-2">
                  <Input
                    label="Día de Emisión"
                    type="text"
                    value={certificadoEditar.diaEmision ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("diaEmision", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Día Emisión"
                  />
                  <Input
                    label="Mes de Emisión"
                    type="text"
                    value={certificadoEditar.mesEmision}
                    onChange={(e) =>
                      manejarCambioEditar("mesEmision", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Mes: Ej. Enero"
                  />
                  <Input
                    label="Año de Emisión"
                    type="text"
                    value={certificadoEditar.anoEmision ?? ""}
                    onChange={(e) =>
                      manejarCambioEditar("anoEmision", e.target.value)
                    }
                    className="w-1/3 border p-2 rounded"
                    placeholder="Año Emisión"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block mb-1 text-[18px] font-medium text-black">
                    Género de la persona a bautizar
                  </label>
                  <select
                    name="genero"
                    value={certificadoEditar.genero}
                    onChange={(e) =>
                      manejarCambioEditar("genero", e.target.value)
                    }
                    className="w-full border p-2 rounded font-semibold"
                    required
                  >
                    <option className="font-semibold" value="">
                      Seleccione Género
                    </option>
                    <option className="font-semibold" value="Masculino">
                      Masculino
                    </option>
                    <option className="font-semibold" value="Femenino">
                      Femenino
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button variant="guardarArchivo" onClick={guardarEdicion}>
                  Guardar Cambios
                </Button>
                <Button
                  variant="cancelarArchivo"
                  onClick={() => setModalConfirmarCancelar("cancelar")} // ← abre modal de confirmación
                >
                  Cancelar Cambios
                </Button>
              </div>
              {/* Modal de confirmación para cancelar */}
              {modalConfirmarCancelar && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                    <p className="text-lg font-semibold text-center mb-4">
                      ¿Estás seguro de cancelar? <br />
                      Los cambios no guardados se perderán.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="eliminarModal"
                        onClick={confirmarCancelar}
                      >
                        Sí, cancelar
                      </Button>
                      <Button
                        variant="conservarModal"
                        onClick={() => setModalConfirmarCancelar(null)}
                      >
                        Volver a edición
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
