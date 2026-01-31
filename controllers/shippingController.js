const getShippingCost = require("../utils/rajaongkir");

const CITY_MAP = {
  bandung: "23",
  jakarta: "152",
  surabaya: "444"
};

exports.getCost = async (req, res) => {
  try {
    let { origin, destination, weight, courier } = req.body;

    console.log("📦 Input:", { origin, destination });

    // 🔁 konversi nama → id
    origin = CITY_MAP[origin.toLowerCase()];
    destination = CITY_MAP[destination.toLowerCase()];

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: "Kota tidak dikenali"
      });
    }

    console.log("🔢 Setelah konversi:", { origin, destination });

    const result = await getShippingCost(
      origin,
      destination,
      weight,
      courier
    );

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
