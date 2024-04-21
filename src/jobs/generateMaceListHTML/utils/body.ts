const body = `
<body class="flex flex-col gap-6 bg-slate-900 font-mono text-white p-4">
  <div class="flex flex-col">
    <div class="font-semibold">
      Всего реплеев:
      <span id="total-replays">0</span>
    </div>
    <div class="font-semibold">
      Дата последнего обновления:
      <span id="update-date">none</span>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <span class="font-semibold">Список реплеев:</span>
    <ul id="list" class="flex flex-col gap-2 pl-4">
      <!-- insert here mace items -->
    </ul>
  </div>
</body>
`;

export default body;
