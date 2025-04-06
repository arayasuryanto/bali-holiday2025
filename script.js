// Format currency - Indonesian Rupiah
function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Category colors
const CATEGORY_COLORS = {
  'Makanan & Minuman': '#FF8042',
  'Transportasi': '#0088FE',
  'Belanja & Oleh-oleh': '#FFBB28',
  'Belanja & Konsumsi': '#00C49F',
  'Akomodasi': '#9966FF',
  'Lain-lain': '#FF6666'
};

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Calculate category totals
  const categoryTotals = {};
  expenseData.forEach(item => {
    if (!categoryTotals[item.Kategori]) {
      categoryTotals[item.Kategori] = 0;
    }
    categoryTotals[item.Kategori] += item['Jumlah (Rp)'];
  });

  // Calculate daily totals
  const dailyTotals = {};
  const dailyCategoryTotals = {};
  
  expenseData.forEach(item => {
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

  // Calculate statistics
  const totalExpense = Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
  
  // Find highest category
  let maxCategorySpend = 0;
  let highestCategory = '';
  Object.keys(categoryTotals).forEach(category => {
    if (categoryTotals[category] > maxCategorySpend) {
      maxCategorySpend = categoryTotals[category];
      highestCategory = category;
    }
  });
  
  // Find highest spending day
  let maxDaySpend = 0;
  let highestDay = '';
  Object.keys(dailyTotals).forEach(day => {
    if (dailyTotals[day] > maxDaySpend) {
      maxDaySpend = dailyTotals[day];
      highestDay = day;
    }
  });

  // Update summary cards
  document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
  document.getElementById('highest-category').textContent = highestCategory;
  document.getElementById('highest-category-amount').textContent = formatCurrency(maxCategorySpend);
  document.getElementById('highest-day').textContent = highestDay;
  document.getElementById('highest-day-amount').textContent = formatCurrency(maxDaySpend);
  document.getElementById('average-expense').textContent = formatCurrency(totalExpense / Object.keys(dailyTotals).length);

  // Create category pie chart
  const pieChartData = Object.keys(categoryTotals).map(category => ({
    name: category,
    value: categoryTotals[category]
  }));

  const pieChart = new Chart(document.getElementById('pie-chart'), {
    type: 'pie',
    data: {
      labels: pieChartData.map(item => item.name),
      datasets: [{
        data: pieChartData.map(item => item.value),
        backgroundColor: pieChartData.map(item => CATEGORY_COLORS[item.name]),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'right'
        }
      }
    }
  });

  // Create bar chart for daily expenses
  const days = Object.keys(dailyTotals).sort();
  const datasets = [];
  
  Object.keys(categoryTotals).forEach(category => {
    datasets.push({
      label: category,
      data: days.map(day => dailyCategoryTotals[day][category] || 0),
      backgroundColor: CATEGORY_COLORS[category]
    });
  });

  const barChart = new Chart(document.getElementById('bar-chart'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          ticks: {
            callback: function(value) {
              return 'Rp' + value.toLocaleString('id-ID');
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
          }
        }
      }
    }
  });

  // Create line chart for expense trend
  const lineChart = new Chart(document.getElementById('line-chart'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Total Pengeluaran',
        data: days.map(day => dailyTotals[day]),
        borderColor: '#8884d8',
        backgroundColor: 'rgba(136, 132, 216, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp' + value.toLocaleString('id-ID');
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Total: ${formatCurrency(context.raw)}`;
            }
          }
        }
      }
    }
  });

  // Populate day filter dropdown
  const dayFilter = document.getElementById('day-filter');
  days.forEach(day => {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    dayFilter.appendChild(option);
  });

  // Initialize expense table
  updateExpenseTable('all');

  // Add event listener to day filter
  dayFilter.addEventListener('change', function() {
    updateExpenseTable(this.value);
  });

  // Function to update expense table based on selected day
  function updateExpenseTable(selectedDay) {
    const tableBody = document.querySelector('#expense-table tbody');
    tableBody.innerHTML = '';

    const filteredData = selectedDay === 'all' 
      ? expenseData 
      : expenseData.filter(item => item.Hari === selectedDay);

    filteredData.forEach(item => {
      const row = document.createElement('tr');
      
      const dayCell = document.createElement('td');
      dayCell.textContent = item.Hari;
      row.appendChild(dayCell);
      
      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = item.Deskripsi;
      row.appendChild(descriptionCell);
      
      const categoryCell = document.createElement('td');
      const categoryBadge = document.createElement('span');
      categoryBadge.className = 'category-badge';
      categoryBadge.textContent = item.Kategori;
      categoryBadge.style.backgroundColor = CATEGORY_COLORS[item.Kategori];
      categoryCell.appendChild(categoryBadge);
      row.appendChild(categoryCell);
      
      const amountCell = document.createElement('td');
      amountCell.className = 'text-right';
      amountCell.textContent = formatCurrency(item['Jumlah (Rp)']);
      row.appendChild(amountCell);
      
      tableBody.appendChild(row);
    });

    // Update table total
    const tableTotal = document.getElementById('table-total');
    const filteredTotal = filteredData.reduce((sum, item) => sum + item['Jumlah (Rp)'], 0);
    tableTotal.textContent = formatCurrency(filteredTotal);
  }
});
