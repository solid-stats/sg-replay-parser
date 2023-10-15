const generateBasicHTML = (title: string, body?: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.cdnfonts.com/css/bitter" rel="stylesheet" />
  </head>
  ${body ?? '<body></body>'}
</html>
`;

export default generateBasicHTML;
