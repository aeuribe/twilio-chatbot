const axios = require("axios");

// Función para obtener el business_id desde el otro backend
async function getBusinessIdByNumber(businessNumber) {
  try {
    const response = await axios.get(`http://localhost:3000/api/business/by-number/${businessNumber}`);

    if (!response.data || !response.data.business_id) {
      console.log("No se encontró un negocio con ese número.");
      return null; // Retorna null si no hay negocio
    }

    return response.data.business_id;
  } catch (error) {
    console.error(`Error al obtener el business_id: ${error.message}`);
    throw new Error("No se pudo obtener el business_id"); // Lanza error para que el controlador lo maneje
  }
}

module.exports = { getBusinessIdByNumber };
