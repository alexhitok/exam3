document.addEventListener('DOMContentLoaded', () => {
    const totalRevenueInput = document.getElementById('totalRevenue');
    const avgOrderValueInput = document.getElementById('avgOrderValue');
    const leadRateInput = document.getElementById('leadResponseRate');
    const prospectRateInput = document.getElementById('prospectResponseRate');

    const leadValueDisplay = document.getElementById('leadResponseValue');
    const prospectValueDisplay = document.getElementById('prospectResponseValue');

    const cardProspects = document.getElementById('cardProspects');
    const cardLeads = document.getElementById('cardLeads');
    const cardCustomers = document.getElementById('cardCustomers');
    
    const leadsPercent = document.getElementById('leadsPercent');
    const customersPercent = document.getElementById('customersPercent');
    
    const leadsBarFill = document.getElementById('leadsBarFill');
    const customersBarFill = document.getElementById('customersBarFill');

    const chartArea = document.getElementById('chartArea');

    function updateSliderBackground(slider) {
        // Calculate percentage for gradient
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--value', `${value}%`);
    }

    function calculateValues() {
        // Parse inputs
        const totalRevenue = parseFloat(totalRevenueInput.value) || 0;
        const avgOrderValue = parseFloat(avgOrderValueInput.value) || 1; // avoid / 0
        const leadResponseRate = parseFloat(leadRateInput.value) / 100; // e.g. 0.4
        const prospectResponseRate = parseFloat(prospectRateInput.value) / 100; // e.g. 0.2

        // Calcs
        const customers = Math.round(totalRevenue / avgOrderValue);
        const leads = leadResponseRate > 0 ? Math.round(customers / leadResponseRate) : 0;
        const prospects = prospectResponseRate > 0 ? Math.round(leads / prospectResponseRate) : 0;

        // Display summary cards
        cardCustomers.textContent = customers;
        cardLeads.textContent = leads;
        cardProspects.textContent = prospects;

        const lPercent = prospects > 0 ? Math.round((leads / prospects) * 100) : 0;
        const cPercent = prospects > 0 ? Math.round((customers / prospects) * 100) : 0;
        
        leadsPercent.textContent = lPercent + '%';
        customersPercent.textContent = cPercent + '%';
        
        leadsBarFill.style.width = lPercent + '%';
        customersBarFill.style.width = cPercent + '%';

        // Draw chart (6 months linear approximation to match screenshot)
        drawChart(prospects, leads, customers);
    }

    function drawChart(maxProspects, maxLeads, maxCustomers) {
        chartArea.innerHTML = '';
        const numMonths = 6;
        const maxChartX = 125; // Base visual purely on max scaling relative to 125 if we want static width, or dynamic 

        for (let i = 1; i <= numMonths; i++) {
            const rowRatio = i / numMonths;
            const mProspects = Math.round(maxProspects * rowRatio);
            const mLeads = Math.round(maxLeads * rowRatio);
            const mCustomers = Math.round(maxCustomers * rowRatio);

            const wrapper = document.createElement('div');
            wrapper.className = 'bar-wrapper';

            // Calculate widths in percentage of max 125 mapped to 100% of container width
            // Or just percentage relative to maxProspects if dynamic
            const scale = (val) => Math.min((val / Math.max(maxProspects, 120)) * 100, 100);

            const pBar = document.createElement('div');
            pBar.className = 'bar bar-prospects';
            pBar.style.width = scale(mProspects) + '%';

            const lBar = document.createElement('div');
            lBar.className = 'bar bar-leads';
            lBar.style.width = scale(mLeads) + '%';

            const cBar = document.createElement('div');
            cBar.className = 'bar bar-customers';
            cBar.style.width = scale(mCustomers) + '%';
            
            pBar.title = `Month #${i}\nProspects: ${mProspects}\nLeads: ${mLeads}\nCustomers: ${mCustomers}`;

            wrapper.appendChild(pBar);
            wrapper.appendChild(lBar);
            wrapper.appendChild(cBar);

            chartArea.appendChild(wrapper);
        }
    }

    // Input handlers
    [leadRateInput, prospectRateInput].forEach(slider => {
        // initialize the inline variable and text style
        updateSliderBackground(slider);

        slider.addEventListener('input', (e) => {
            updateSliderBackground(e.target);
            if (e.target.id === 'leadResponseRate') {
                leadValueDisplay.textContent = parseFloat(e.target.value).toFixed(2) + '%';
            } else {
                prospectValueDisplay.textContent = parseFloat(e.target.value).toFixed(2) + '%';
            }
            calculateValues();
        });
    });

    [totalRevenueInput, avgOrderValueInput].forEach(input => {
        input.addEventListener('input', calculateValues);
    });

    // Initial calc
    calculateValues();
});