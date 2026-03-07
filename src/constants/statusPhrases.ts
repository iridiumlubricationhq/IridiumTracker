export const STATUS_LIVE_PHRASES: Record<string, Record<number, string[]>> = {
  ms: {
    0: [
      'Mendaftar kenderaan...',
      'Menyemak rekod...',
      'Menyediakan borang digital...',
      'Menugaskan mekanik...',
      'Mengesahkan butiran...',
      'Menyediakan tag kunci...'
    ],
    1: [
      'Memeriksa enjin...',
      'Menilai brek...',
      'Menguji bendalir...',
      'Menyemak tayar...',
      'Melakukan imbasan komputer...',
      'Memeriksa bateri...',
      'Menyemak lampu...'
    ],
    2: [
      'Menukar minyak enjin...',
      'Mengganti penapis...',
      'Mengetatkan komponen...',
      'Melakukan pelinciran...',
      'Membersihkan palam pencucuh...',
      'Menyemak tali sawat...',
      'Membersihkan penapis udara...'
    ],
    3: [
      'Mengambil alat ganti...',
      'Memasang komponen...',
      'Mengkalibrasi sensor...',
      'Menguji alat ganti...',
      'Mengganti penapis aircond...'
    ],
    4: [
      'Melakukan ujian jalan raya untuk prestasi...',
      'Menyemak semula semua kerja teknikal dilakukan...',
      'Memastikan tiada sebarang kebocoran bendalir...',
      'Mengesahkan kualiti mengikut piawaian Iridium...',
      'Menandatangani sijil pemeriksaan kualiti akhir...',
      'Melakukan pemeriksaan keselamatan menyeluruh (QC)...',
      'Menetapkan semula (reset) komputer servis...',
      'Memastikan semua skru roda diketatkan semula...',
      'Menyemak tahap emisi & bunyi enjin...'
    ],
    5: [
      'Membasuh kenderaan...',
      'Memvakum dalaman...',
      'Mengilat tayar...',
      'Menyembur pewangi...',
      'Membersihkan cermin...',
      'Membersihkan papan pemuka...'
    ]
  },
  en: {
    0: [
      'Registering vehicle...',
      'Checking records...',
      'Preparing forms...',
      'Assigning mechanic...',
      'Confirming details...',
      'Preparing key tags...'
    ],
    1: [
      'Inspecting engine...',
      'Evaluating brakes...',
      'Testing fluids...',
      'Checking tires...',
      'Running computer scan...',
      'Checking battery...',
      'Verifying lights...'
    ],
    2: [
      'Changing engine oil...',
      'Replacing filters...',
      'Tightening components...',
      'Lubricating parts...',
      'Cleaning spark plugs...',
      'Checking beltings...',
      'Cleaning air filter...'
    ],
    3: [
      'Retrieving parts...',
      'Installing components...',
      'Calibrating sensors...',
      'Testing parts...',
      'Replacing cabin filter...'
    ],
    4: [
      'Performing road test for performance...',
      'Reviewing all technical work performed...',
      'Ensuring no fluid leaks...',
      'Confirming quality to Iridium standards...',
      'Signing final quality inspection certificate...',
      'Performing comprehensive safety check (QC)...',
      'Resetting service computer...',
      'Ensuring all wheel bolts are retightened...',
      'Checking emission levels & engine noise...'
    ],
    5: [
      'Washing vehicle...',
      'Vacuuming interior...',
      'Polishing tires...',
      'Applying fragrance...',
      'Cleaning windows...',
      'Cleaning dashboard...'
    ]
  }
};

export const STATUS_SUBTITLES: Record<string, Record<number, string>> = {
  ms: {
    0: 'Kenderaan anda telah selamat diterima di pusat servis kami.',
    1: 'Pakar kami sedang melakukan pemeriksaan menyeluruh.',
    2: 'Proses servis sedang dijalankan mengikut piawaian.',
    3: 'Alat ganti sedang dipasang oleh juruteknik bertauliah.',
    4: 'Pemeriksaan kualiti akhir untuk memastikan segalanya sempurna.',
    5: 'Kenderaan anda sedang dibersihkan dan dikilatkan.',
    6: 'Semua urusan telah selesai. Terima kasih!'
  },
  en: {
    0: 'Your vehicle has been safely received at our service center.',
    1: 'Our experts are performing a comprehensive inspection.',
    2: 'The service process is being carried out according to standards.',
    3: 'Parts are being installed by certified technicians.',
    4: 'Final quality inspection to ensure everything is perfect.',
    5: 'Your vehicle is being cleaned and polished.',
    6: 'Everything is complete. Thank you!'
  }
};

export const UI_TRANSLATIONS: Record<string, Record<string, string | string[]>> = {
  ms: {
    liveStatus: 'Status Langsung',
    service: 'Servis',
    estimatedCompletion: 'Anggaran Siap',
    done: 'Selesai',
    readyForPickup: 'Sedia untuk Diambil',
    vehicleReady: 'Kenderaan anda sedia untuk diambil. Terima kasih.',
    progress: 'Perkembangan',
    timeline: 'Garis Masa Status',
    jobNotFound: 'Tugasan Tidak Ditemui',
    invalidLink: 'Pautan penjejakan ini tidak sah atau telah tamat tempoh.',
    loading: 'Memuatkan...',
    chooseTheme: 'Pilih Tema',
    chooseLanguage: 'Pilih Bahasa',
    continue: 'Teruskan',
    light: 'Cerah',
    dark: 'Gelap',
    english: 'English',
    malay: 'Bahasa Melayu',
    welcome: 'Selamat Datang ke Iridium',
    setupExperience: 'Sila pilih pilihan anda untuk pengalaman terbaik.',
    activeJobs: 'Tugasan Aktif',
    manageJobs: 'Urus dan pantau perkembangan servis kenderaan pelanggan.',
    searchPlaceholder: 'Cari No. Plat atau Model...',
    newJob: 'Tugasan Baru',
    logout: 'Log Keluar',
    deleteAll: 'Padam Semua',
    deleteAllConfirm: 'Adakah anda pasti mahu memadam SEMUA tugasan? Tindakan ini tidak boleh dibatalkan.',
    plateNumber: 'Nombor Plat',
    carModel: 'Model Kenderaan',
    serviceType: 'Jenis Servis',
    estimatedCompletionLabel: 'Anggaran Siap',
    createJob: 'Cipta Tugasan',
    processing: 'Memproses...',
    deleteJobTitle: 'Padam Tugasan',
    deleteJobConfirm: 'Adakah anda pasti mahu memadam tugasan ini? Tindakan ini tidak boleh dibatalkan.',
    cancel: 'Batal',
    delete: 'Padam',
    qrTracking: 'QR Penjejakan',
    scanToTrack: 'Imbas untuk melihat perkembangan langsung untuk',
    openLink: 'Buka Pautan',
    close: 'Tutup',
    noActiveJobs: 'Tiada tugasan aktif',
    createFirstJob: 'Cipta tugasan baru untuk mula menjejak.',
    nextStep: 'Langkah Seterusnya',
    created: 'Dicipta',
    newEntry: 'Kemasukan Baru',
    edit: 'Edit',
    save: 'Simpan',
    serviceOptions: ['Servis Minor', 'Servis Major', 'Diagnostik', 'Aircond', 'Enjin'],
    carBrands: ['Proton', 'Perodua', 'Toyota', 'Honda', 'Mazda', 'BMW', 'Mercedes']
  },
  en: {
    liveStatus: 'Live Status',
    service: 'Service',
    estimatedCompletion: 'Estimated Completion',
    done: 'Done',
    readyForPickup: 'Ready for Pickup',
    vehicleReady: 'Your vehicle is ready for pickup. Thank you.',
    progress: 'Progress',
    timeline: 'Status Timeline',
    jobNotFound: 'Job Not Found',
    invalidLink: 'This tracking link is invalid or has expired.',
    loading: 'Loading...',
    chooseTheme: 'Choose Theme',
    chooseLanguage: 'Choose Language',
    continue: 'Continue',
    light: 'Light',
    dark: 'Dark',
    english: 'English',
    malay: 'Bahasa Melayu',
    welcome: 'Welcome to Iridium',
    setupExperience: 'Please choose your preferences for the best experience.',
    activeJobs: 'Active Jobs',
    manageJobs: 'Manage and monitor customer vehicle service progress.',
    searchPlaceholder: 'Search Plate No. or Model...',
    newJob: 'New Job',
    logout: 'Logout',
    deleteAll: 'Delete All',
    deleteAllConfirm: 'Are you sure you want to delete ALL jobs? This action cannot be undone.',
    plateNumber: 'Plate Number',
    carModel: 'Vehicle Model',
    serviceType: 'Service Type',
    estimatedCompletionLabel: 'Estimated Completion',
    createJob: 'Create Job',
    processing: 'Processing...',
    deleteJobTitle: 'Delete Job',
    deleteJobConfirm: 'Are you sure you want to delete this job? This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    qrTracking: 'Tracking QR',
    scanToTrack: 'Scan to view live progress for',
    openLink: 'Open Link',
    close: 'Close',
    noActiveJobs: 'No active jobs',
    createFirstJob: 'Create a new job to start tracking.',
    nextStep: 'Next Step',
    created: 'Created',
    newEntry: 'New Entry',
    edit: 'Edit',
    save: 'Save',
    serviceOptions: ['Minor Service', 'Major Service', 'Diagnostic', 'Aircond', 'Engine'],
    carBrands: ['Proton', 'Perodua', 'Toyota', 'Honda', 'Mazda', 'BMW', 'Mercedes']
  }
};

export const STATUS_NAMES: Record<string, string[]> = {
  ms: [
    'Kenderaan Diterima',
    'Pemeriksaan Sedang Dijalankan',
    'Servis Sedang Dijalankan',
    'Penggantian Alat Ganti',
    'Pemeriksaan 45 Check-Point',
    'Cucian Kereta',
    'Sedia untuk Diambil'
  ],
  en: [
    'Vehicle Received',
    'Inspection in Progress',
    'Service in Progress',
    'Parts Replacement',
    '45 Check-Point Inspection',
    'Car Wash',
    'Ready for Pickup'
  ]
};
