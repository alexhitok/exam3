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

    // Translations
    const translations = {
        en: {
            language: "Language",
            currency: "Currency",
            campaignStart: "Campaign Start",
            campaignEnd: "Campaign End",
            totalRevenue: "Total Revenue",
            avgOrderValue: "Avg. Order Value",
            prospects: "Prospects",
            leads: "Leads",
            customers: "Customers",
            leadResponseRate: "Lead Response Rate",
            prospectResponseRate: "Prospect Response Rate"
        },
        bg: {
            language: "Език",
            currency: "Валута",
            campaignStart: "Начало на кампанията",
            campaignEnd: "Край на кампанията",
            totalRevenue: "Общи приходи",
            avgOrderValue: "Ср. стойност на поръчката",
            prospects: "Потенциални",
            leads: "Лийдове",
            customers: "Клиенти",
            leadResponseRate: "Процент на отговор (Лийдове)",
            prospectResponseRate: "Процент на отговор (Потенциални)"
        },
        de: {
            language: "Sprache",
            currency: "Währung",
            campaignStart: "Kampagnenstart",
            campaignEnd: "Kampagnenende",
            totalRevenue: "Gesamtumsatz",
            avgOrderValue: "Durchschn. Bestellwert",
            prospects: "Interessenten",
            leads: "Leads",
            customers: "Kunden",
            leadResponseRate: "Lead-Antwortrate",
            prospectResponseRate: "Interessenten-Antwortrate"
        },
        fr: {
            language: "Langue",
            currency: "Devise",
            campaignStart: "Début de campagne",
            campaignEnd: "Fin de campagne",
            totalRevenue: "Revenu total",
            avgOrderValue: "Valeur moy. des commandes",
            prospects: "Prospects",
            leads: "Contacts",
            customers: "Clients",
            leadResponseRate: "Taux de réponse des contacts",
            prospectResponseRate: "Taux de réponse des prospects"
        },
        es: {
            language: "Idioma",
            currency: "Moneda",
            campaignStart: "Inicio de campaña",
            campaignEnd: "Fin de campaña",
            totalRevenue: "Ingresos totales",
            avgOrderValue: "Valor promedio del pedido",
            prospects: "Prospectos",
            leads: "Leads",
            customers: "Clientes",
            leadResponseRate: "Tasa de respuesta de leads",
            prospectResponseRate: "Tasa de respuesta de prospectos"
        }
    };

    const languageSelect = document.getElementById('language');
    languageSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
    });
});