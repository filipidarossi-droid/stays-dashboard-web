class StaysDashboard {
    constructor() {
        this.config = window.CONFIG;
        this.currentDate = new Date();
        this.currentMonth = this.config.CURRENT_MONTH;
        this.refreshInterval = null;
        this.tooltip = document.getElementById('tooltip');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            if (this.tooltip.style.display === 'block') {
                this.tooltip.style.left = (e.pageX + 10) + 'px';
                this.tooltip.style.top = (e.pageY + 10) + 'px';
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            this.hideError();
            
            const [calendarData, repasseData] = await Promise.all([
                this.fetchCalendarData(),
                this.fetchRepasseData()
            ]);

            this.renderCards(calendarData, repasseData);
            this.renderCalendar(calendarData);
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError();
        } finally {
            this.showLoading(false);
        }
    }

    async fetchCalendarData() {
        const response = await fetch(`${this.config.API_BASE_URL}/calendario?mes=${this.currentMonth}`, {
            headers: {
                'Authorization': `Bearer ${this.config.API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Calendar API error: ${response.status}`);
        }
        
        return await response.json();
    }

    async fetchRepasseData() {
        const response = await fetch(`${this.config.API_BASE_URL}/repasse?mes=${this.currentMonth}&incluir_limpeza=true`, {
            headers: {
                'Authorization': `Bearer ${this.config.API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Repasse API error: ${response.status}`);
        }
        
        return await response.json();
    }

    renderCards(calendarData, repasseData) {
        const today = new Date();
        const currentDay = today.getDate();
        const totalDays = calendarData.dias.length;
        
        const metrics = this.calculateOccupancyMetrics(calendarData.dias, currentDay);
        
        document.getElementById('ateHojePerc').textContent = `${metrics.ateHoje.percentage}%`;
        document.getElementById('ateHojeFrac').textContent = `${metrics.ateHoje.occupied}/${metrics.ateHoje.total}`;
        
        document.getElementById('futuroPerc').textContent = `${metrics.futuro.percentage}%`;
        document.getElementById('futuroFrac').textContent = `${metrics.futuro.occupied}/${metrics.futuro.total}`;
        
        document.getElementById('fechamentoPerc').textContent = `${metrics.fechamento.percentage}%`;
        document.getElementById('fechamentoFrac').textContent = `${metrics.fechamento.occupied}/${metrics.fechamento.total}`;
        
        document.getElementById('repasseValue').textContent = this.formatCurrency(repasseData.repasse_estimado);
        document.getElementById('repasseStatus').textContent = repasseData.status;
        document.getElementById('repasseMeta').textContent = `Meta: ${this.formatCurrency(repasseData.meta)}`;
    }

    calculateOccupancyMetrics(dias, currentDay) {
        const ateHojeDays = dias.slice(0, currentDay);
        const futuroDays = dias.slice(currentDay);
        const allDays = dias;

        const calculateOccupancy = (daysList) => {
            const total = daysList.length;
            const occupied = daysList.filter(day => day.reservas.length > 0).length;
            const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
            return { total, occupied, percentage };
        };

        return {
            ateHoje: calculateOccupancy(ateHojeDays),
            futuro: calculateOccupancy(futuroDays),
            fechamento: calculateOccupancy(allDays)
        };
    }

    renderCalendar(calendarData) {
        const calendarGrid = document.getElementById('calendarGrid');
        const calendarTitle = document.getElementById('calendarTitle');
        
        const [year, month] = this.currentMonth.split('-');
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        calendarTitle.textContent = `Calendário - ${monthNames[parseInt(month) - 1]} ${year}`;
        
        calendarGrid.innerHTML = '';
        
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekdays.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-header-day';
            header.textContent = day;
            header.style.cssText = `
                text-align: center;
                font-weight: 600;
                color: #94a3b8;
                padding: 0.5rem;
                font-size: 0.875rem;
            `;
            calendarGrid.appendChild(header);
        });
        
        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        const firstDayOfWeek = firstDay.getDay();
        
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty-slot';
            emptyDay.style.opacity = '0.3';
            calendarGrid.appendChild(emptyDay);
        }
        
        const consecutiveEmptyDays = this.findConsecutiveEmptyDays(calendarData.dias);
        
        calendarData.dias.forEach((dayData, index) => {
            const dayElement = this.createDayElement(dayData, consecutiveEmptyDays);
            calendarGrid.appendChild(dayElement);
        });
    }

    findConsecutiveEmptyDays(dias) {
        const today = new Date().getDate();
        const consecutiveSequences = [];
        let currentSequence = [];
        
        for (let i = 0; i < Math.min(today, dias.length); i++) {
            if (dias[i].reservas.length === 0) {
                currentSequence.push(i + 1);
            } else {
                if (currentSequence.length >= 3) {
                    consecutiveSequences.push([...currentSequence]);
                }
                currentSequence = [];
            }
        }
        
        if (currentSequence.length >= 3) {
            consecutiveSequences.push([...currentSequence]);
        }
        
        return consecutiveSequences.flat();
    }

    createDayElement(dayData, consecutiveEmptyDays) {
        const dayElement = document.createElement('div');
        const isOccupied = dayData.reservas.length > 0;
        const isToday = dayData.dia === new Date().getDate();
        const hasAlert = consecutiveEmptyDays.includes(dayData.dia);
        
        dayElement.className = `calendar-day ${isOccupied ? 'occupied' : 'empty'} ${isToday ? 'today' : ''}`;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = dayData.dia;
        dayElement.appendChild(dayNumber);
        
        if (isOccupied) {
            const status = document.createElement('div');
            status.className = 'day-status';
            const reservation = dayData.reservas[0];
            status.textContent = this.getStatusText(reservation.status);
            dayElement.appendChild(status);
        }
        
        if (hasAlert) {
            const alertIcon = document.createElement('div');
            alertIcon.className = 'alert-icon';
            alertIcon.textContent = '🚨';
            dayElement.appendChild(alertIcon);
        }
        
        dayElement.addEventListener('mouseenter', (e) => {
            this.showTooltip(e, dayData);
        });
        
        dayElement.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        return dayElement;
    }

    getStatusText(status) {
        const statusMap = {
            'checkin': 'Check-in',
            'checkout': 'Check-out',
            'ocupado': 'Ocupado'
        };
        return statusMap[status] || status;
    }

    showTooltip(event, dayData) {
        const tooltipContent = document.getElementById('tooltipContent');
        
        if (dayData.reservas.length > 0) {
            const reservation = dayData.reservas[0];
            tooltipContent.innerHTML = `
                <strong>Dia ${dayData.dia}</strong><br>
                <strong>Hóspede:</strong> ${reservation.hospede}<br>
                <strong>Status:</strong> ${this.getStatusText(reservation.status)}<br>
                <strong>Valor:</strong> ${this.formatCurrency(reservation.total_bruto)}<br>
                <strong>ID:</strong> ${reservation.id}
            `;
        } else {
            tooltipContent.innerHTML = `
                <strong>Dia ${dayData.dia}</strong><br>
                <span style="color: #ef4444;">Sem reservas</span>
            `;
        }
        
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (event.pageX + 10) + 'px';
        this.tooltip.style.top = (event.pageY + 10) + 'px';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = `Atualizado às ${timeString}`;
        
        const statusDot = document.querySelector('.status-dot');
        statusDot.classList.remove('error');
    }

    showLoading(show) {
        const container = document.querySelector('.container');
        if (show) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }

    showError() {
        const errorMessage = document.getElementById('errorMessage');
        const statusDot = document.querySelector('.status-dot');
        
        errorMessage.style.display = 'block';
        statusDot.classList.add('error');
        
        document.getElementById('lastUpdate').textContent = 'Erro na atualização';
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'none';
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            console.log('Auto-refreshing dashboard data...');
            this.loadData();
        }, this.config.REFRESH_INTERVAL);
        
        console.log(`Auto-refresh started: every ${this.config.REFRESH_INTERVAL / 1000} seconds`);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new StaysDashboard();
});

document.addEventListener('visibilitychange', () => {
    if (window.dashboard) {
        if (document.hidden) {
            console.log('Page hidden, stopping auto-refresh');
            window.dashboard.stopAutoRefresh();
        } else {
            console.log('Page visible, resuming auto-refresh');
            window.dashboard.startAutoRefresh();
            window.dashboard.loadData();
        }
    }
});
