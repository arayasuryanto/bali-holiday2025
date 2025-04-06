// Constants
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CATEGORY_COLORS = {
    'Makanan & Minuman': '#FF8042',
    'Transportasi': '#0088FE',
    'Belanja & Oleh-oleh': '#FFBB28',
    'Belanja & Konsumsi': '#00C49F',
    'Akomodasi': '#9966FF',
    'Lain-lain': '#FF6666'
  };
  
  // Destructure React components
  const { 
    useState, useEffect,
    BarChart, Bar, PieChart, Pie, LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell
  } = Recharts;
  
  // Dashboard Component
  const BaliExpenseDashboard = () => {
    const [data, setData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [highestCategory, setHighestCategory] = useState('');
    const [highestDay, setHighestDay] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('all');
    const [detailData, setDetailData] = useState([]);
  
    useEffect(() => {
      // Use the data from data.js instead of fetching from a file
      const processedData = expenseData;
      
      setData(processedData);
      setDetailData(processedData);
      
      // Calculate totals by category
      const categoryTotals = {};
      processedData.forEach(item => {
        if (!categoryTotals[item.Kategori]) {
          categoryTotals[item.Kategori] = 0;
        }
        categoryTotals[item.Kategori] += item['Jumlah (Rp)'];
      });
  
      const categoryDataArray = Object.keys(categoryTotals).map(category => ({
        name: category,
        value: categoryTotals[category],
        color: CATEGORY_COLORS[category] || '#999999'
      }));
  
      setCategoryData(categoryDataArray);
  
      // Calculate totals by day
      const dailyTotals = {};
      const dailyCategoryTotals = {};
      
      processedData.forEach(item => {
        if (!dailyTotals[item.Hari]) {
          dailyTotals[item.Hari] = 0;
          dailyCategoryTotals[item.Hari] = {};
        }
        
        dailyTotals[item.Hari] += item['Jumlah (Rp)'];
        
        if (!dailyCategoryTotals[item.Hari][item.Kategori]) {
          dailyCategoryTotals[item.Hari][item.Kategori] = 0;
        }
        
        dailyCategoryTotals[item.Hari][item.Kategori] += item['Jumlah (Rp)'];
      });
  
      const dailyDataArray = Object.keys(dailyTotals).map(day => {
        const dayData = { 
          name: day,
          total: dailyTotals[day]
        };
        
        Object.keys(categoryTotals).forEach(category => {
          dayData[category] = dailyCategoryTotals[day][category] || 0;
        });
        
        return dayData;
      });
  
      setDailyData(dailyDataArray);
      
      // Calculate statistics
      const total = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
      setTotalSpent(total);
      
      // Find highest category
      let maxCategorySpend = 0;
      let maxCategory = '';
      Object.keys(categoryTotals).forEach(category => {
        if (categoryTotals[category] > maxCategorySpend) {
          maxCategorySpend = categoryTotals[category];
          maxCategory = category;
        }
      });
      setHighestCategory(maxCategory);
      
      // Find highest spending day
      let maxDaySpend = 0;
      let maxDay = '';
      Object.keys(dailyTotals).forEach(day => {
        if (dailyTotals[day] > maxDaySpend) {
          maxDaySpend = dailyTotals[day];
          maxDay = day;
        }
      });
      setHighestDay(maxDay);
      
      setLoading(false);
    }, []);
  
    useEffect(() => {
      if (data.length > 0) {
        if (selectedDay === 'all') {
          setDetailData(data);
        } else {
          setDetailData(data.filter(item => item.Hari === selectedDay));
        }
      }
    }, [selectedDay, data]);
  
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold text-gray-600">Loading data...</div>
        </div>
      );
    }
  
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-blue-800">Dashboard Pengeluaran Liburan Bali</h1>
          <p className="text-center text-gray-600">Tracking pengeluaran selama liburan di Bali (D0-D4) berdasarkan kategori, lokasi, dan hari</p>
          <div className="mt-2 text-center text-xs text-gray-500">
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Makanan & Minuman'] }}>Makanan & Minuman</span>
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Transportasi'] }}>Transportasi</span>
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Belanja & Oleh-oleh'] }}>Belanja & Oleh-oleh</span>
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Belanja & Konsumsi'] }}>Belanja & Konsumsi</span>
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Akomodasi'] }}>Akomodasi</span>
            <span className="inline-block px-2 py-1 rounded-full text-xs text-white mr-2" style={{ backgroundColor: CATEGORY_COLORS['Lain-lain'] }}>Lain-lain</span>
          </div>
        </div>
  
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Pengeluaran</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Kategori Tertinggi</h3>
            <p className="text-2xl font-bold text-blue-600">{highestCategory}</p>
            <p className="text-sm text-gray-500">
              {highestCategory && formatCurrency(categoryData.find(c => c.name === highestCategory)?.value || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Hari Pengeluaran Tertinggi</h3>
            <p className="text-2xl font-bold text-blue-600">{highestDay}</p>
            <p className="text-sm text-gray-500">
              {highestDay && formatCurrency(dailyData.find(d => d.name === highestDay)?.total || 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Rata-rata per Hari</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalSpent / (dailyData.length || 1))}
            </p>
          </div>
        </div>
  
        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart for Category Distribution */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Distribusi Pengeluaran per Kategori</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
  
          {/* Bar Chart for Daily Expenses */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pengeluaran Harian</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rp${value / 1000}K`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                {categoryData.map((category, index) => (
                  <Bar 
                    key={category.name}
                    dataKey={category.name} 
                    stackId="a" 
                    fill={category.color} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Filter and Table Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Detail Pengeluaran</h3>
            <select 
              className="border rounded-md p-2"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="all">Semua Hari</option>
              {dailyData.map(day => (
                <option key={day.name} value={day.name}>{day.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Hari</th>
                  <th className="py-2 px-4 border-b text-left">Deskripsi</th>
                  <th className="py-2 px-4 border-b text-left">Kategori</th>
                  <th className="py-2 px-4 border-b text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.Hari}</td>
                    <td className="py-2 px-4 border-b">{item.Deskripsi}</td>
                    <td className="py-2 px-4 border-b">
                      <span 
                        className="inline-block px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[item.Kategori] || '#999999' }}
                      >
                        {item.Kategori}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b text-right">{formatCurrency(item['Jumlah (Rp)'])}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan="3" className="py-2 px-4 border-b font-semibold text-right">Total:</td>
                  <td className="py-2 px-4 border-b font-semibold text-right">
                    {formatCurrency(detailData.reduce((sum, item) => sum + item['Jumlah (Rp)'], 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
  
        {/* Daily Expense Trend */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tren Pengeluaran Harian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Rp${value / 1000}K`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total Pengeluaran" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  // Render the dashboard to the DOM
  ReactDOM.render(<BaliExpenseDashboard />, document.getElementById('root'));