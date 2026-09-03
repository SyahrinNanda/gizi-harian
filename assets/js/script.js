document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('assets/data.json');
    const menuData = await response.json();

    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthsIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const today = new Date();
    const currentDayOfWeek = today.getDay(); 
    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const todayStr = `${daysIndo[today.getDay()]}, ${today.getDate()} ${monthsIndo[today.getMonth()]} ${today.getFullYear()}`;
    
    const headerDate = document.getElementById('current-date');
    const mainDate = document.getElementById('main-date');
    if(headerDate) headerDate.textContent = todayStr;
    if(mainDate) mainDate.textContent = todayStr;

    const weeklyMenuContainer = document.getElementById('weekly-menu');
    if (!weeklyMenuContainer) return;
    weeklyMenuContainer.innerHTML = ''; 

    // RENDER DOM ELEMENTS based on selected day data
    const renderDayContent = (dayId) => {
      const data = menuData.find(d => d.day_id === dayId);
      if(!data) return;

      // 1. Update Dokumentasi
      const dokBatch = document.getElementById('dok-batch');
      const dokImg = document.getElementById('dok-img');
      const dokDesc = document.getElementById('dok-desc');
      
      if(dokBatch) dokBatch.textContent = data.dokumentasi.batch_time;
      if(dokImg) {
        dokImg.src = data.dokumentasi.image_url;
        // re-trigger animation
        dokImg.classList.remove('group-hover:scale-105');
        void dokImg.offsetWidth;
        dokImg.classList.add('group-hover:scale-105', 'animate-scale-in');
        setTimeout(() => dokImg.classList.remove('animate-scale-in'), 500);
      }
      if(dokDesc) dokDesc.textContent = data.dokumentasi.description;

      // 2. Update Isi Ompreng
      const foodCardsContainer = document.getElementById('food-cards-container');
      if(foodCardsContainer) {
        let cardsHtml = '';
        data.isi_ompreng.forEach((item, itemIndex) => {
          const colSpan = item.is_block_right ? 'sm:col-span-2' : '';
          let badgeHtml = '';
          if (item.category === 'Makanan Pokok') badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary-fixed uppercase tracking-wider font-semibold">${item.category}</span>`;
          else if (item.category === 'Lauk Hewani') badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded bg-amber-500/15 text-primary uppercase tracking-wider font-semibold">${item.category}</span>`;
          else if (item.category === 'Lauk Nabati') badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary/15 text-tertiary uppercase tracking-wider font-semibold">${item.category}</span>`;
          else if (item.category === 'Sayur Segar') badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase tracking-wider font-semibold">${item.category}</span>`;
          else if (item.category === 'Buah Segar') badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 uppercase tracking-wider font-semibold">${item.category}</span>`;
          else badgeHtml = `<span class="whitespace-nowrap font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface uppercase tracking-wider font-semibold">${item.category}</span>`;

          if (item.is_block_right) {
            cardsHtml += `
              <div style="animation-delay: ${itemIndex * 75}ms" class="food-card opacity-0 animate-fade-in-up ${colSpan} bg-surface-container-high rounded-xl p-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm sm:gap-space-md hover:bg-surface-container-highest transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5">
                <div class="flex items-start sm:items-center gap-space-sm">
                  <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm transition-transform duration-300 icon-wrapper mt-1 sm:mt-0">
                    <span class="material-symbols-outlined text-[22px]">${item.icon}</span>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex flex-wrap items-center gap-space-xs">
                      ${badgeHtml}
                      <span class="font-label-sm text-label-sm text-emerald-400 flex items-center gap-0.5 whitespace-nowrap"><span class="material-symbols-outlined text-[13px]">check</span>${item.badge || ''}</span>
                    </div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold mt-1">${item.title}</h3>
                    <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 sm:line-clamp-none">${item.desc}</p>
                  </div>
                </div>
                <div class="text-left sm:text-right shrink-0 pl-14 sm:pl-0 border-t border-surface-container sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                  <span class="block font-metric-num-md text-metric-num-md text-on-surface">${item.left_bottom}</span>
                  <span class="block font-label-sm text-label-sm text-outline mt-0.5">${item.right_bottom}</span>
                </div>
              </div>
            `;
          } else {
            cardsHtml += `
              <div style="animation-delay: ${itemIndex * 75}ms" class="food-card opacity-0 animate-fade-in-up bg-surface-container-high rounded-xl p-space-sm flex flex-col justify-between gap-space-xs hover:bg-surface-container-highest transition-all hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5">
                <div class="flex items-center justify-between">
                  ${badgeHtml}
                  <span class="material-symbols-outlined text-primary text-[20px] transition-transform duration-300 icon-wrapper">${item.icon}</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${item.title}</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${item.desc}</p>
                </div>
                <div class="pt-space-xxs flex items-center justify-between font-label-sm text-label-sm text-outline">
                  <span>${item.left_bottom}</span>
                  <span class="text-on-surface font-semibold">${item.right_bottom}</span>
                </div>
              </div>
            `;
          }
        });
        foodCardsContainer.innerHTML = cardsHtml;
      }

      // 3. Update Gizi Table
      const giziTableBody = document.querySelector('table tbody');
      if(giziTableBody) {
        giziTableBody.innerHTML = `
          <tr style="animation-delay: 150ms" class="hover:bg-white/[0.04] transition-colors group opacity-0 animate-fade-in-up">
            <td class="py-space-sm px-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-amber-400 text-[18px] group-hover:scale-110 transition-transform">bolt</span>
                <span class="font-semibold text-on-surface">Energi Total</span>
              </div>
            </td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/20"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.energi.kecil}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">kkal</span></td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/40"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.energi.besar}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">kkal</span></td>
            <td class="py-space-sm px-space-sm text-right"><span class="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">${data.gizi.energi.akg}</span></td>
          </tr>
          <tr style="animation-delay: 225ms" class="hover:bg-white/[0.04] transition-colors group opacity-0 animate-fade-in-up">
            <td class="py-space-sm px-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-tertiary-container text-[18px] group-hover:scale-110 transition-transform">fitness_center</span>
                <span class="font-semibold text-on-surface">Protein</span>
              </div>
            </td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/20"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.protein.kecil}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/40"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.protein.besar}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-right"><span class="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-label-sm text-label-sm font-semibold">${data.gizi.protein.akg}</span></td>
          </tr>
          <tr style="animation-delay: 300ms" class="hover:bg-white/[0.04] transition-colors group opacity-0 animate-fade-in-up">
            <td class="py-space-sm px-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-yellow-300 text-[18px] group-hover:scale-110 transition-transform">opacity</span>
                <span class="font-semibold text-on-surface">Lemak Sehat</span>
              </div>
            </td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/20"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.lemak.kecil}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/40"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.lemak.besar}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-right"><span class="inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">${data.gizi.lemak.akg}</span></td>
          </tr>
          <tr style="animation-delay: 375ms" class="hover:bg-white/[0.04] transition-colors group opacity-0 animate-fade-in-up">
            <td class="py-space-sm px-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-amber-500 text-[18px] group-hover:scale-110 transition-transform">grain</span>
                <span class="font-semibold text-on-surface">Karbohidrat</span>
              </div>
            </td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/20"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.karbohidrat.kecil}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/40"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.karbohidrat.besar}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-right"><span class="inline-block px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">${data.gizi.karbohidrat.akg}</span></td>
          </tr>
          <tr style="animation-delay: 450ms" class="hover:bg-white/[0.04] transition-colors group opacity-0 animate-fade-in-up">
            <td class="py-space-sm px-space-sm">
              <div class="flex items-center gap-space-xs">
                <span class="material-symbols-outlined text-emerald-400 text-[18px] group-hover:scale-110 transition-transform">grass</span>
                <span class="font-semibold text-on-surface">Serat Pangan</span>
              </div>
            </td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/20"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.serat.kecil}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-center bg-surface-container-high/40"><span class="font-metric-num-md text-metric-num-md text-primary font-bold">${data.gizi.serat.besar}</span><span class="font-label-sm text-label-sm text-on-surface-variant ml-1">gram</span></td>
            <td class="py-space-sm px-space-sm text-right"><span class="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-label-sm text-label-sm font-semibold">${data.gizi.serat.akg}</span></td>
          </tr>
        `;
      }

      // 4. Update AKG Charts
      const chartsContainer = document.querySelector('.progress-charts');
      if (chartsContainer) {
        chartsContainer.innerHTML = `
          <!-- Box Porsi Kecil -->
          <div style="animation-delay: 200ms" class="opacity-0 animate-fade-in-up bg-surface-container-high/70 p-space-md rounded-xl flex flex-col gap-space-xs border border-surface-container-high hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-label-md text-on-surface font-semibold">Tingkat Kecukupan AKG (Porsi Kecil)</span>
              <span class="font-label-sm text-label-sm text-primary font-bold">${data.akg_charts.kecil.kalori.current >= 100 && data.akg_charts.kecil.protein.current >= 100 ? '100%' : Math.min(data.akg_charts.kecil.kalori.current, data.akg_charts.kecil.protein.current) + '%'} Target Tercapai</span>
            </div>
            <div class="space-y-3 mt-1">
              <div>
                <div class="flex justify-between text-[11px] text-outline mb-1 font-semibold tracking-wider">
                  <span>KALORI</span>
                  <span class="text-on-surface font-mono">${data.akg_charts.kecil.kalori.current}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div class="progress-bar h-full bg-primary rounded-full transition-all duration-[1500ms] ease-out" style="width: 0%;" data-width="${Math.min(100, data.akg_charts.kecil.kalori.current)}%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-outline mb-1 font-semibold tracking-wider">
                  <span>PROTEIN</span>
                  <span class="text-on-surface font-mono">${data.akg_charts.kecil.protein.current}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div class="progress-bar h-full bg-tertiary-container rounded-full transition-all duration-[1500ms] ease-out delay-150" style="width: 0%;" data-width="${Math.min(100, data.akg_charts.kecil.protein.current)}%"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Box Porsi Besar -->
          <div style="animation-delay: 350ms" class="opacity-0 animate-fade-in-up bg-surface-container-high/70 p-space-md rounded-xl flex flex-col gap-space-xs border border-surface-container-high hover:border-primary/30 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-label-md text-on-surface font-semibold">Tingkat Kecukupan AKG (Porsi Besar)</span>
              <span class="font-label-sm text-label-sm text-primary font-bold">${data.akg_charts.besar.kalori.current >= 100 && data.akg_charts.besar.protein.current >= 100 ? '100%' : Math.min(data.akg_charts.besar.kalori.current, data.akg_charts.besar.protein.current) + '%'} Target Tercapai</span>
            </div>
            <div class="space-y-3 mt-1">
              <div>
                <div class="flex justify-between text-[11px] text-outline mb-1 font-semibold tracking-wider">
                  <span>KALORI</span>
                  <span class="text-on-surface font-mono">${data.akg_charts.besar.kalori.current}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div class="progress-bar h-full bg-primary rounded-full transition-all duration-[1500ms] ease-out delay-200" style="width: 0%;" data-width="${Math.min(100, data.akg_charts.besar.kalori.current)}%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-outline mb-1 font-semibold tracking-wider">
                  <span>PROTEIN</span>
                  <span class="text-on-surface font-mono">${data.akg_charts.besar.protein.current}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                  <div class="progress-bar h-full bg-tertiary-container rounded-full transition-all duration-[1500ms] ease-out delay-300" style="width: 0%;" data-width="${Math.min(100, data.akg_charts.besar.protein.current)}%"></div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Re-trigger animations
        setTimeout(() => {
          const bars = chartsContainer.querySelectorAll('.progress-bar');
          bars.forEach(b => {
            b.style.width = b.getAttribute('data-width');
          });
        }, 50);
      }
    };

    // Generate Weekly Menu Buttons
    let renderedToday = false;
    menuData.forEach((menu, index) => {
      const menuDate = new Date(monday);
      menuDate.setDate(monday.getDate() + index);

      const isToday = menuDate.toDateString() === today.toDateString();
      const isPast = menuDate < today && !isToday;
      const isTomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString() === menuDate.toDateString();

      let statusHtml = '';
      let btnClass = '';
      let numClass = '';
      let titleClass = '';
      let dayName = daysIndo[menuDate.getDay()];

      if (isToday) {
        btnClass = 'menu-day-btn active-day w-full flex items-center justify-between px-space-sm py-space-sm rounded-lg bg-primary text-on-primary font-semibold shadow-md transform scale-[1.02] text-left transition-transform';
        numClass = 'font-metric-num-md text-metric-num-md text-on-primary w-8';
        titleClass = 'font-label-md text-label-md font-bold tracking-tight';
        dayName = `${dayName} (Hari Ini)`;
        statusHtml = `<span class="material-symbols-outlined text-[18px]">restaurant</span>`;
      } else {
        btnClass = `menu-day-btn w-full flex items-center justify-between px-space-sm py-space-xs rounded-lg ${isPast ? 'bg-surface-container-low/70' : (isTomorrow ? 'bg-surface-container-low/70' : 'bg-surface-container-low/40 opacity-75')} hover:bg-surface-container-high transition-all text-left group`;
        numClass = 'font-metric-num-md text-metric-num-md text-on-surface-variant group-hover:text-on-surface w-8';
        titleClass = 'font-label-md text-label-md text-on-surface-variant font-semibold';

        if (isPast) {
          statusHtml = `<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">Selesai</span>`;
        } else if (isTomorrow) {
          statusHtml = `<span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-primary/20 text-primary">Besok</span>`;
        } else {
          statusHtml = `<span class="font-label-sm text-label-sm text-outline">Terjadwal</span>`;
        }
      }

      const html = `
        <button class="${btnClass}" type="button">
          <div class="flex items-center gap-space-sm">
            <span class="${numClass}">${menuDate.getDate()}</span>
            <div class="flex flex-col">
              <span class="${titleClass}">${dayName}</span>
              <span class="font-body-sm text-body-sm text-outline truncate max-w-[130px] ${isToday ? 'text-on-primary/90' : ''}">${menu.title}</span>
            </div>
          </div>
          ${statusHtml}
        </button>
      `;
      weeklyMenuContainer.insertAdjacentHTML('beforeend', html);
      
      if (isToday) {
        renderDayContent(menu.day_id);
        renderedToday = true;
      }

      // Attach click listener manually since we recreate the DOM
      const insertedBtn = weeklyMenuContainer.lastElementChild;
      insertedBtn.addEventListener('click', () => {
        document.querySelectorAll('.menu-day-btn').forEach(b => {
           b.classList.remove('active-day', 'bg-primary', 'text-on-primary', 'font-semibold', 'shadow-md', 'scale-[1.02]');
           b.classList.add('bg-surface-container-low/70', 'hover:bg-surface-container-high', 'group');
           const num = b.querySelector('.font-metric-num-md'); if(num) { num.classList.remove('text-on-primary'); num.classList.add('text-on-surface-variant', 'group-hover:text-on-surface'); }
        });
        insertedBtn.classList.add('active-day', 'bg-primary', 'text-on-primary', 'font-semibold', 'shadow-md', 'scale-[1.02]');
        insertedBtn.classList.remove('bg-surface-container-low/70', 'hover:bg-surface-container-high', 'group', 'opacity-75', 'bg-surface-container-low/40');
        const insertedNum = insertedBtn.querySelector('.font-metric-num-md'); if(insertedNum) { insertedNum.classList.add('text-on-primary'); insertedNum.classList.remove('text-on-surface-variant', 'group-hover:text-on-surface'); }
        
        // Re-render content
        renderDayContent(menu.day_id);
      });
    });

    // Default to first day if today is not in the list (e.g. Sunday)
    if (!renderedToday && menuData.length > 0) {
      renderDayContent(menuData[0].day_id);
      const firstBtn = weeklyMenuContainer.firstElementChild;
      if(firstBtn) {
        firstBtn.click();
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});
