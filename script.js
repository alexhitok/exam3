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
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.style.visibility = 'hidden';
    document.body.appendChild(tooltip);

    function updateTooltipPosition(event) {
        const offset = 14;
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;

        let left = event.clientX + offset;
        let top = event.clientY + offset;

        if (left + tooltipWidth > window.innerWidth - 8) {
            left = event.clientX - tooltipWidth - offset;
        }

        if (top + tooltipHeight > window.innerHeight - 8) {
            top = event.clientY - tooltipHeight - offset;
        }

        tooltip.style.left = `${Math.max(8, left)}px`;
        tooltip.style.top = `${Math.max(8, top)}px`;
    }

    function showTooltip(event, month, prospects, leads, customers) {
        tooltip.innerHTML = `Month #${month}<br>Prospects: ${prospects}<br>Leads: ${leads}<br>Customers: ${customers}`;
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        updateTooltipPosition(event);
    }

    function hideTooltip() {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
    }

    function updateSliderBackground(slider) {
        // Calculate percentage for gradient
        const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.setProperty('--value', `${value}%`);
    }

    function countUp(element, endValue) {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (endValue - startValue) + startValue);
            element.textContent = current.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
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

        // Display summary cards with animation
        countUp(cardCustomers, customers);
        countUp(cardLeads, leads);
        countUp(cardProspects, prospects);

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
            pBar.style.width = '0%'; // Start at 0 for animation
            
            const lBar = document.createElement('div');
            lBar.className = 'bar bar-leads';
            lBar.style.width = '0%';
            
            const cBar = document.createElement('div');
            cBar.className = 'bar bar-customers';
            cBar.style.width = '0%';

            // Trigger animation after append
            setTimeout(() => {
                pBar.style.width = scale(mProspects) + '%';
                lBar.style.width = scale(mLeads) + '%';
                cBar.style.width = scale(mCustomers) + '%';
            }, 50 * i); // Staggered delay

            [pBar, lBar, cBar].forEach((bar) => {
                bar.addEventListener('mouseenter', (event) => {
                    showTooltip(event, i, mProspects, mLeads, mCustomers);
                });

                bar.addEventListener('mousemove', updateTooltipPosition);
                bar.addEventListener('mouseleave', hideTooltip);
            });

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

    // 3D Card Effect
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
        });
    });

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