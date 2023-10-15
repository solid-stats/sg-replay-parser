const body = `
<body class="flex flex-col gap-6 bg-slate-900 font-mono text-white p-4">
  <div class="flex flex-col">
    <div class="font-semibold">
      Дата последнего обновления:
      <span id="update-date">none</span>
    </div>
  </div>

  <div class="flex flex-col gap-1">
    <span class="font-semibold">Список картоделов:</span>
    <ul id="mission-makers-list" class="flex flex-col gap-2 pl-4">

    </ul>
  </div>

  <div class="flex flex-col gap-1">
    <span class="font-semibold">Список начинающих картоделов:</span>
    <ul id="junior-mission-makers-list" class="flex flex-col gap-2 pl-4">

    </ul>
  </div>
</body>
`;

export default body;
