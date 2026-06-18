import React, { useState, useEffect } from "react"
import {
  FaMapMarkedAlt,
  FaStore,
  FaPhone,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaFilter,
  FaSearch,
  FaChartLine,
  FaBuilding,
  FaMapPin,
} from "react-icons/fa"

export default function StoreMapPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState(null)
  const [filterCity, setFilterCity] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cities, setCities] = useState([])
  const [selectedProvince, setSelectedProvince] = useState(null)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores/all")
      const data = await response.json()
      setStores(data)

      const uniqueCities = [...new Set(data.map((store) => extractCity(store.address)))]
      setCities(uniqueCities)

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching stores:", error)
      setLoading(false)
    }
  }

  const extractCity = (address) => {
    const parts = address.split(",")
    return parts[parts.length - 1]?.trim() || "Unknown"
  }

  // City to Province mapping
  const cityToProvince = {
    // Punjab cities
    "lahore": "Punjab",
    "islamabad": "Punjab",
    "rawalpindi": "Punjab",
    "faisalabad": "Punjab",
    "multan": "Punjab",
    "gujranwala": "Punjab",
    "sialkot": "Punjab",
    "bahawalpur": "Punjab",
    "sargodha": "Punjab",
    "sheikhupura": "Punjab",
    "jhang": "Punjab",
    "rahim yar khan": "Punjab",
    "gujrat": "Punjab",
    "kasur": "Punjab",
    "sahiwal": "Punjab",
    
    // Sindh cities
    "karachi": "Sindh",
    "hyderabad": "Sindh",
    "sukkur": "Sindh",
    "larkana": "Sindh",
    "nawabshah": "Sindh",
    "mirpur khas": "Sindh",
    "jacobabad": "Sindh",
    "shikarpur": "Sindh",
    "khairpur": "Sindh",
    "dadu": "Sindh",
    
    // KPK cities
    "peshawar": "KPK",
    "mardan": "KPK",
    "abbottabad": "KPK",
    "mingora": "KPK",
    "kohat": "KPK",
    "dera ismail khan": "KPK",
    "swabi": "KPK",
    "charsadda": "KPK",
    "nowshera": "KPK",
    "mansehra": "KPK",
    
    // Balochistan cities
    "quetta": "Balochistan",
    "turbat": "Balochistan",
    "khuzdar": "Balochistan",
    "hub": "Balochistan",
    "chaman": "Balochistan",
    "gwadar": "Balochistan",
    "zhob": "Balochistan",
    "sibi": "Balochistan",
    "loralai": "Balochistan",
  }

  const getProvinceForCity = (city) => {
    const cityLower = city.toLowerCase()
    return cityToProvince[cityLower] || "Unknown"
  }

  // Get cities with their provinces
  const citiesWithProvinces = cities.map(city => ({
    name: city,
    province: getProvinceForCity(city),
    count: stores.filter(s => extractCity(s.address) === city).length
  }))

  const pakistanRegions = [
    {
      name: "Punjab",
      count: stores.filter((s) => getProvinceForCity(extractCity(s.address)) === "Punjab").length,
      cities: citiesWithProvinces.filter(c => c.province === "Punjab"),
      color: "#7C3AED",
    },
    {
      name: "Sindh",
      count: stores.filter((s) => getProvinceForCity(extractCity(s.address)) === "Sindh").length,
      cities: citiesWithProvinces.filter(c => c.province === "Sindh"),
      color: "#6B21A8",
    },
    {
      name: "KPK",
      count: stores.filter((s) => getProvinceForCity(extractCity(s.address)) === "KPK").length,
      cities: citiesWithProvinces.filter(c => c.province === "KPK"),
      color: "#581C87",
    },
    {
      name: "Balochistan",
      count: stores.filter((s) => getProvinceForCity(extractCity(s.address)) === "Balochistan").length,
      cities: citiesWithProvinces.filter(c => c.province === "Balochistan"),
      color: "#4C1D95",
    },
  ]

  const filteredStores = stores.filter((store) => {
    const matchesCity = filterCity === "all" || extractCity(store.address) === filterCity
    const matchesSearch =
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCity && matchesSearch
  })

  const totalStoresCount = stores.length
  const gpsEnabledCount = stores.filter((s) => s.latitude && s.longitude).length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Store Distribution Analytics</h1>
              <p className="text-gray-400 text-lg">Real-time monitoring of retail locations across Pakistan</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-purple-600/10 border border-purple-600/30 rounded-lg">
                <span className="text-purple-400 text-sm font-medium">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Quadrant */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                <FaStore className="text-2xl text-purple-400" />
              </div>
              <FaChartLine className="text-gray-600 text-lg" />
            </div>
            <p className="text-5xl font-bold text-white mb-2">{totalStoresCount}</p>
            <p className="text-gray-400 text-sm font-medium tracking-wide">TOTAL STORES</p>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <span className="text-green-400 text-xs font-medium">+12% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                <FaBuilding className="text-2xl text-purple-400" />
              </div>
              <FaChartLine className="text-gray-600 text-lg" />
            </div>
            <p className="text-5xl font-bold text-white mb-2">{cities.length}</p>
            <p className="text-gray-400 text-sm font-medium tracking-wide">CITIES COVERED</p>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex flex-wrap gap-1">
                {citiesWithProvinces.slice(0, 3).map((city, idx) => (
                  <span key={idx} className="text-xs text-purple-400 font-medium">
                    {city.name} ({city.province}){idx < Math.min(2, citiesWithProvinces.length - 1) ? ',' : ''}
                  </span>
                ))}
                {citiesWithProvinces.length > 3 && (
                  <span className="text-xs text-gray-500 font-medium">+{citiesWithProvinces.length - 3} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                <FaMapPin className="text-2xl text-purple-400" />
              </div>
              <FaChartLine className="text-gray-600 text-lg" />
            </div>
            <p className="text-5xl font-bold text-white mb-2">{gpsEnabledCount}</p>
            <p className="text-gray-400 text-sm font-medium tracking-wide">GPS ENABLED</p>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <span className="text-purple-400 text-xs font-medium">
                {totalStoresCount > 0 ? Math.round((gpsEnabledCount / totalStoresCount) * 100) : 0}% coverage
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-purple-600/50 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                <FaMapMarkedAlt className="text-2xl text-purple-400" />
              </div>
              <FaChartLine className="text-gray-600 text-lg" />
            </div>
            <p className="text-5xl font-bold text-white mb-2">4</p>
            <p className="text-gray-400 text-sm font-medium tracking-wide">PROVINCES</p>
            <div className="mt-3 pt-3 border-t border-gray-800">
              <span className="text-gray-500 text-xs font-medium">National coverage</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Pakistan Store Distribution</h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-800 rounded-md text-xs text-gray-400">Interactive Map</div>
                </div>
              </div>

              {/* Pakistan Map SVG - Complete province boundaries */}
              <div className="relative bg-black rounded-xl p-8 border border-gray-800">
                <svg id="map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1628 1544" className="w-full h-auto" style={{ maxHeight: "700px" }}>
                  
                  {/* Islamabad */}
                  <g transform="translate(-27.1,-28.1)">
                    <path 
                      d="m 1246.3,392.4 -3.2,-4.2 -2.8,0.2 -10.6,-7.8 -25.6,9.2 -11.8,3.6 6.4,13.8 18,-8.8 6.8,10.2 -3.8,3 6,4.8 11.2,-7.2 1.6,-9 z" 
                      fill={selectedProvince === "Punjab" ? "#7C3AED" : "#7C3AED50"}
                      stroke="#7C3AED"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all hover:fill-[#7C3AED] hover:stroke-[#A78BFA]" 
                      onMouseEnter={() => setSelectedProvince("Punjab")} 
                      onMouseLeave={() => setSelectedProvince(null)} 
                    />
                  </g>

                  {/* Balochistan - Complete Border */}
                  <g transform="translate(-27.1,-28.1)">
                    <path 
                      d="m 796.8,635.3 -13.8,7.4 -14.6,0.8 -11.8,-9 -10.4,15.6 -20,12 -15,9.2 -16,-1.6 6,14.8 15.4,-1.6 1.8,8 -42,16 -6.8,-0.6 -24.2,-2.2 -4,-10.8 -28.6,12.8 -4.8,15.8 -12,11.2 -17.2,4.2 -11,42.8 7.4,17 -11.2,42.2 11.8,9.6 -10.6,13.2 -118.8,36.8 -43.4,-5.2 -36.6,6.6 -16.2,17 -51.4,-13 -113.4,11.6 -157.8,-54.4 48.2,60.6 12.8,37.8 31.6,42.2 31.2,17.8 26.4,5.8 21.2,20.6 20,-2.4 -2,29.8 8,53.8 -6.8,36.2 16,4.8 24,-5.6 13.4,11.8 -6.2,6.4 2.6,23.9 -9,3.6 -2.2,22.6 -36.6,-0.6 -53,15 2,19.8 -14.2,-4.2 -2.8,7.6 -28.2,10.4 -7.2,49.2 -8,0.4 2.8,14.6 -10.2,54 16.6,1.4 -4.6,17 10.8,1 1.6,-6.2 24.8,-2 -3.8,-5.4 3.6,-6 11.8,-2 8.6,4.2 -2.4,9.6 10.6,0 -5.2,-5.6 14.6,-7.2 -1.8,-3 27,-2.4 27,5.2 10,-4.4 40.2,7 1.4,-2.4 -5.2,-8.2 10,-8.8 17.6,-2.8 18.2,5.8 14.2,-0.8 -3.6,-8.4 -2.6,3 -3.2,-3.2 6.2,-4 11.4,0.4 -1.8,3 -5.4,2.4 4,8.6 13.4,1.4 17.8,9.6 10.8,-4.6 9,7.2 -3,4 4.4,1.2 6,-1.8 -4.6,-4.6 2.4,-7.4 10.4,-4.6 29.4,1.6 8.6,1.8 7,-9.2 5.8,1 5.2,-3 4,3.2 6.8,-2.2 21.2,4.4 19,-8.6 44.4,-5.8 19,8 1.8,-0.8 -4.8,-6 2.8,-2.6 -4.2,-1.4 -2.4,1.4 -8.4,-8.2 -7.6,1 -5,6.2 -7.8,-2 2.4,-6.4 11.2,-5.2 4.4,1.4 6.2,-3 13.6,13.2 1.6,-1.6 5.6,15.8 -3.4,0.4 2.4,5.4 15.6,15.6 -5,34.4 2.4,0.8 17,-14.6 6.8,-0.6 8,-9.4 0.4,-7.2 10.6,-10.8 3.4,-18.2 20.8,-27.2 7.2,-21.8 0.6,-29.6 -22.8,-39.8 -8,-26.8 -1.4,-73.3 9.6,-29.2 15.8,-33.6 27.6,-6 26,-11.4 10.6,-15.2 32.6,-21.4 11.8,-14.2 66.4,-2.4 25,-0.8 -5,-12 11.2,-6.4 8.6,-20.2 -3.8,-10.8 21,-21.8 4.6,-24 -5.4,3 -4.8,-6.6 2.2,-7 -10.6,-3.4 4.2,-26.8 13.4,-5.4 15.6,-22.8 8.2,-23.8 7.6,-15.2 -9.6,3.8 -3.6,-7 4.2,-17.4 10.6,-20.8 -1,-9.2 12,-13.2 6.2,-0.8 -2.2,-6.2 1.2,-23.4 -2.4,-5 4,-24.8 -1.4,-17 -16.6,8 -5.6,9.8 -2.6,-16.8 -8.6,-5.2 2.4,-43.8 -7.6,5.2 -3,-3.2 3.8,-8.2 -7.2,-4.6 3,-9.6 -16.8,4.6 -10.6,11.6 -21.8,-1 -12.6,10.6 -7.8,16.8 -10,8.8 -7.2,-2.2 -5.2,5 -9.2,-1 -8.8,-9.8 -1.4,-8.6 -6.2,-0.6 z" 
                      fill={selectedProvince === "Balochistan" ? "#4C1D95" : "#4C1D9550"}
                      stroke="#4C1D95"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all hover:fill-[#4C1D95] hover:stroke-[#6B21A8]"
                      onMouseEnter={() => setSelectedProvince("Balochistan")}
                      onMouseLeave={() => setSelectedProvince(null)}
                    />
                  </g>

                  {/* Sindh - Complete Border */}
                  <g transform="translate(-27.1,-28.1)">
                    <path 
                      d="m 911.6,1021.5 -23.6,-6.2 -9.6,4.4 -35,1.2 -56.4,2 -11.8,14.2 -32.6,21.4 -10.6,15.2 -26,11.4 -27.6,6 -15.8,33.6 -9.6,29.2 1.4,73.3 8,26.8 22.8,39.8 -0.6,29.6 -7.2,21.8 -20.8,27.2 -3.4,18.2 -10.6,10.8 -0.4,7.2 -8,9.4 -6.8,0.6 -17,14.6 -5,7.6 20.4,-3.4 9.8,5.8 -0.2,-4.2 12,8.6 0.2,-3.6 10.6,5 5,-2.4 2.2,4.2 -6,3 -5,8 1,4 5.6,-0.4 4,3.2 -6,3.2 3.8,3.8 2.8,12.6 2.8,-2.6 -0.8,9 8.2,1.8 -7.2,3.4 5,25.6 19.8,4 0.2,13.4 -3.8,7.4 11.4,3.2 3.2,-9.4 3,15.6 6.6,-0.4 -2.2,-5.2 11.8,3.6 2,-11.6 16.6,16.6 -1.4,-19.6 5.6,2.4 3.4,12.6 -5,9.6 4.6,2.8 1,-3.8 4.4,5 0.8,-24.2 3.8,14.4 4.6,-14.4 12.8,-9.6 38,2.2 1.4,-36.4 6.2,-3.4 3,12.2 6.8,-10.8 7,8.2 9.8,-5 10.8,3.8 11,-4.8 13.2,0.8 14.8,-1.8 13.4,12.8 30,0.6 8.6,-13.2 26,-8 20.4,-7.6 2,3.4 -3.2,3.8 1.2,12 10,3.4 13.2,0.2 9.8,-5 -3.8,-3.8 11.4,-7.4 3.4,1.2 11,-6.6 -10.4,-2.8 -3,-19.4 9.6,-10.4 -14,-26.4 -7,-26.4 -21,-28 0.6,-31.6 -6,-5.4 -20.2,4.2 -13.4,-3.6 -6.6,-9.6 -10.8,-15.8 -2.2,-14.4 9.2,-21.6 -0.4,-35 -10.2,-5.6 -18.6,2 -39,-21 2.2,-28.7 7.4,-18.8 23.8,-24.6 20,-20.6 8.4,-22.6 9.8,-13.4 -18,-8.4 -13,-17.8 -6.2,-24.6 z" 
                      fill={selectedProvince === "Sindh" ? "#6B21A8" : "#6B21A850"}
                      stroke="#6B21A8"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all hover:fill-[#6B21A8] hover:stroke-[#9333EA]"
                      onMouseEnter={() => setSelectedProvince("Sindh")}
                      onMouseLeave={() => setSelectedProvince(null)}
                    />
                  </g>

                  {/* Punjab - Complete Border */}
                  <g transform="translate(-27.1,-28.1)">
                    <path 
                      d="m 1303,439.9 -6.2,-11.2 3,-8.6 -8.6,-35.9 -13.2,6 -4.6,9.3 -16.6,9.2 10.6,7.8 2.8,-0.2 3.2,4.2 -7.8,7.8 -1.6,9 -11.2,7.2 -6,-4.8 3.8,-3 -6.8,-10.2 -18,8.8 -6.4,-13.8 11.8,-3.6 -10.8,-4.2 5.2,-4.8 -2.6,-8.9 -8.6,-5.8 -7,7.3 -7.2,-2.5 2.6,-5.4 -17.2,-9.4 -20.4,9.4 0,18.7 -21,2.2 -7.8,25.2 -9.2,14 -14,6.4 -2.4,9.4 5.6,10.4 -4.2,12.8 -10.8,-4.6 -4.8,-12.6 -18.4,-2.2 6.2,18.4 -2.2,7.4 -15.2,1.6 -12.8,8 -3.6,19.6 6.4,19 7.6,0 -0.2,10.6 9.6,-3.6 -0.6,18.8 -10,3.8 -11,21.8 -9.8,30.6 -15.8,23.2 -4.4,16.6 6,1 -4.4,14.8 -7.6,14.4 -7.2,-6 -13.6,-1.6 -16.6,13.8 -13.4,6.4 0.6,10 -3,0.4 -1.2,23.4 2.2,6.2 -6.2,0.8 -12,13.2 1,9.2 -10.6,20.8 -4.2,17.4 3.6,7 9.6,-3.8 -7.6,15.2 -8.2,23.8 -15.6,22.8 -13.4,5.4 -4.2,26.8 10.6,3.4 -2.2,7 4.8,6.6 5.4,-3 -4.6,24 -21,21.8 3.8,10.8 -8.6,20.2 -11.2,6.4 5,12 9.6,-4.4 23.6,6.2 11.6,16.8 6.2,24.6 13,17.8 18,8.4 16,-14.4 19.6,-1.2 11,12 3.2,13.2 5.4,9.6 12.8,1.2 35.8,-16.4 50.2,-7 15.4,-6.2 2.2,-17.4 26.2,-28 11.8,-35.2 9.4,-12.8 20.8,-11.6 34.6,-19.6 30.8,-55.2 13.8,-47.4 40.8,-15.2 16.2,-13.8 -2.2,-13.2 -6.8,-6.4 5.6,-11.2 10.8,-8.8 3.8,1.6 2.2,-10 13.2,-12.8 13.4,-19.2 18.2,-12.2 0.6,-8.2 8.6,4.8 4.8,-5 -2.4,-4.8 -11.8,-3 0.4,-18.6 9,-19.6 -12.4,-34 19.4,-22.8 9.2,1.4 13,-13 6.6,3.6 21.4,-10.4 2.2,4 14.8,-20.4 -7,-9.6 -12.4,-9.2 -6,0.4 -7.8,-8.2 -7.8,5.2 -7.4,-2.8 -8,-2.8 -12,1.2 -6.4,-12.4 1.6,-14.4 4.8,-14 -16.6,11.4 -8.4,-9.2 -12.8,0.4 -30.8,-15 -9,-10 -11.6,3 -17.6,-9.8 3.2,-7.2 -2.6,-7 -6.6,-17.8 z" 
                      fill={selectedProvince === "Punjab" ? "#7C3AED" : "#7C3AED50"}
                      stroke="#7C3AED"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all hover:fill-[#7C3AED] hover:stroke-[#A78BFA]"
                      onMouseEnter={() => setSelectedProvince("Punjab")}
                      onMouseLeave={() => setSelectedProvince(null)}
                    />
                  </g>

                  {/* Khyber Pakhtunkhwa - Complete Border */}
                  <g transform="translate(-27.1,-28.1)">
                    <path 
                      d="m 1244.6,78 32.4,-8.6 21.4,4.8 26.2,0 0.6,-9 -12.8,-5.4 -8.4,-8.2 -28.6,2.6 -21.2,-1.6 -11.8,4 -5.8,-1.6 -4.4,3.2 -28.6,-0.4 -14.2,8.2 -25.4,2.8 -4.6,7 1.8,3.2 -11.2,2 -0.6,5.8 -16,4.2 -2.8,6.4 -7.6,0 -1.4,7.2 4.4,1.6 -1.8,5.2 -19.6,-11.4 -8.6,12.2 -0.2,5.8 -31.4,23.4 -4.4,10 17.4,9.4 9.2,13.6 1.2,8.4 6.6,4.8 -4.6,10.8 11.2,6.2 -1.8,8.6 5.4,5.2 -9.4,18 12,11.6 -13.8,12.2 1.8,8 -5.4,6.4 10,17 15.6,4.2 -0.4,13.6 -8.6,5 -3.8,10 5,8.8 -21.8,29.4 -9.8,13 5,25.9 8,4.6 0.2,9 9.4,3 10.6,-3.8 4.2,-7.2 10.2,6.8 1.4,4.2 -5,5 2,6 -13.8,11.2 -8,0.8 -3,-5.4 4.2,-4.8 -18.4,-3.6 -10.2,1.8 -16.6,-11.6 -6,0.6 -2.4,15.8 -16.6,3 -17,-2.8 -3.2,10 -23.4,8.2 14,17 10.8,4.2 13.2,5.2 -15.8,16.4 -17.2,-0.8 -16.2,27 2.6,15 7.4,8 12,13.2 -2.6,6.2 -10,-6 -9.4,14.4 -30.2,21 5,21.4 6.8,3.4 2.6,27.2 18.4,60.4 16.6,-13.8 13.6,1.6 7.2,6 7.6,-14.4 4.4,-14.8 -6,-1 4.4,-16.6 15.8,-23.2 9.8,-30.6 11,-21.8 10,-3.8 0.6,-18.8 -9.6,3.6 0.2,-10.6 -7.6,0 -6.4,-19 3.6,-19.6 12.8,-8 15.2,-1.6 2.2,-7.4 -6.2,-18.4 18.4,2.2 4.8,12.6 10.8,4.6 4.2,-12.8 -5.6,-10.4 2.4,-9.4 14,-6.4 9.2,-14 7.8,-25.2 21,-2.2 0,-18.7 20.4,-9.4 17.2,9.4 -2.6,5.4 7.2,2.5 7,-7.3 8.6,5.8 2.6,8.9 -5.2,4.8 10.8,4.2 25.6,-9.2 16.6,-9.2 4.6,-9.3 13.2,-6 -11.4,-44.6 3.6,-10.8 3,-9 16.6,1 9,-23.4 25.4,-11 11.4,-18.6 -2.8,-4.2 6.6,-7.4 -21.2,-9.4 -18.6,-1.6 -3,-11.2 1.4,-11.4 9.4,-10 -53,-13 -16,-14 0.6,-11.6 -4.8,-3 -9.8,3.6 -15.2,-2.6 -15.4,4.4 -15.8,-9.4 5.2,-12.4 -4.4,-7.4 2.6,-17.4 30.8,-18.4 2.8,-8.6 7.4,-1.4 11.6,-15.6 z" 
                      fill={selectedProvince === "KPK" ? "#581C87" : "#581C8750"}
                      stroke="#581C87"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all hover:fill-[#581C87] hover:stroke-[#7C3AED]"
                      onMouseEnter={() => setSelectedProvince("KPK")}
                      onMouseLeave={() => setSelectedProvince(null)}
                    />
                  </g>

                  {/* Province Labels */}
                  <text x="550" y="950" fill="white" fontSize="32" fontWeight="bold" textAnchor="middle">
                    Balochistan
                  </text>
                  <text x="550" y="995" fill="#E9D5FF" fontSize="40" fontWeight="bold" textAnchor="middle">
                    {pakistanRegions.find(r => r.name === "Balochistan")?.count || 0}
                  </text>

                  <text x="850" y="1250" fill="white" fontSize="32" fontWeight="bold" textAnchor="middle">
                    Sindh
                  </text>
                  <text x="850" y="1295" fill="#E9D5FF" fontSize="40" fontWeight="bold" textAnchor="middle">
                    {pakistanRegions.find(r => r.name === "Sindh")?.count || 0}
                  </text>

                  <text x="1250" y="650" fill="white" fontSize="32" fontWeight="bold" textAnchor="middle">
                    Punjab
                  </text>
                  <text x="1250" y="695" fill="#E9D5FF" fontSize="40" fontWeight="bold" textAnchor="middle">
                    {pakistanRegions.find(r => r.name === "Punjab")?.count || 0}
                  </text>

                  <text x="1150" y="350" fill="white" fontSize="32" fontWeight="bold" textAnchor="middle">
                    KPK
                  </text>
                  <text x="1150" y="395" fill="#E9D5FF" fontSize="40" fontWeight="bold" textAnchor="middle">
                    {pakistanRegions.find(r => r.name === "KPK")?.count || 0}
                  </text>
                </svg>

                {/* Legend */}
                <div className="absolute bottom-8 right-8 bg-gray-900/95 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm font-bold text-white mb-3 tracking-wide">LEGEND</p>
                  <div className="space-y-2">
                    {pakistanRegions.map((region, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: region.color }} />
                        <span className="text-xs text-gray-300 font-medium min-w-[100px]">{region.name}</span>
                        <span className="text-xs text-purple-400 font-bold">{region.count} stores</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hover Info */}
                {selectedProvince && (
                  <div className="absolute top-8 left-8 bg-purple-600 border border-purple-400 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    <p className="text-white font-bold text-lg">{selectedProvince}</p>
                    <p className="text-purple-100 text-sm">
                      {pakistanRegions.find((r) => r.name === selectedProvince)?.count || 0} retail locations
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-6 text-center">
                Hover over regions to view detailed store distribution
              </p>
            </div>

            {/* Province Breakdown */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {pakistanRegions.map((region, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-5 hover:border-purple-600/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm font-medium">{region.name}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{region.count}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {totalStoresCount > 0
                      ? `${Math.round((region.count / totalStoresCount) * 100)}% of total`
                      : "0% of total"}
                  </p>
                  {region.cities.length > 0 && (
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-xs text-purple-400 font-medium mb-2">Cities:</p>
                      <div className="flex flex-wrap gap-1">
                        {region.cities.map((city, idx) => (
                          <span key={idx} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                            {city.name} ({city.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Store Directory Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Store Directory</h2>
                <FaFilter className="text-purple-400" />
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
                />
              </div>

              {/* City Filter */}
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full mb-6 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Cities</option>
                {citiesWithProvinces.map((cityInfo, index) => (
                  <option key={index} value={cityInfo.name}>
                    {cityInfo.name} ({cityInfo.province}) - {cityInfo.count} stores
                  </option>
                ))}
              </select>

              {/* Store List */}
              <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-sm">Loading stores...</p>
                  </div>
                ) : filteredStores.length === 0 ? (
                  <div className="text-center py-12">
                    <FaStore className="text-5xl text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No stores found</p>
                  </div>
                ) : (
                  filteredStores.map((store) => (
                    <div
                      key={store.storeID}
                      className="border border-gray-800 rounded-lg p-4 hover:border-purple-600/50 hover:bg-gray-900/50 transition-all cursor-pointer group"
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                            {store.storeName}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <FaMapMarkerAlt className="mr-2 text-purple-600" />
                            {extractCity(store.address)} • {getProvinceForCity(extractCity(store.address))}
                          </p>
                        </div>
                        <FaStore className="text-purple-600 text-lg" />
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-1">{store.address}</p>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-800">
                        <span className="text-gray-500 flex items-center">
                          <FaPhone className="mr-2" />
                          {store.contactNumber}
                        </span>
                        {store.googleMapsUrl && (
                          <a
                            href={store.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                          >
                            <FaExternalLinkAlt />
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Store Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedStore.storeName}</h2>
                <span className="px-3 py-1 bg-purple-600/20 border border-purple-600/30 rounded-full text-purple-400 text-xs font-medium">
                  Active Store
                </span>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="text-gray-400 hover:text-white text-3xl transition-colors hover:rotate-90 transform duration-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-black/50 rounded-lg border border-gray-800">
                <div className="p-3 bg-purple-600/10 rounded-lg">
                  <FaMapMarkerAlt className="text-purple-400 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-300 mb-1 text-sm">ADDRESS</p>
                  <p className="text-white">{selectedStore.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-black/50 rounded-lg border border-gray-800">
                <div className="p-3 bg-purple-600/10 rounded-lg">
                  <FaPhone className="text-purple-400 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-300 mb-1 text-sm">CONTACT</p>
                  <p className="text-white">{selectedStore.contactNumber}</p>
                </div>
              </div>

              {selectedStore.description && (
                <div className="flex items-start gap-4 p-4 bg-black/50 rounded-lg border border-gray-800">
                  <div className="p-3 bg-purple-600/10 rounded-lg">
                    <FaStore className="text-purple-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-300 mb-1 text-sm">DESCRIPTION</p>
                    <p className="text-white">{selectedStore.description}</p>
                  </div>
                </div>
              )}

              {selectedStore.googleMapsUrl && (
                <a
                  href={selectedStore.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 transition-all font-medium mt-6 group"
                >
                  <FaExternalLinkAlt className="group-hover:translate-x-1 transition-transform" />
                  <span>Open in Google Maps</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #7C3AED;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9333EA;
        }
      `}</style>
    </div>
  )
}
