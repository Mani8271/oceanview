const fs = require('fs');
const path = require('path');

const dir = 'd:/git/hotel/client/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Master.js')); 

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let original = content;
  
  content = content.replace(
    /await api\.put\((.*)\);(\s*)toast\.success\((.*)\);/g,
    'const resPut = await api.put($1);$2if(!resPut) return;$2toast.success($3);'
  );

  content = content.replace(
    /await api\.post\((.*)\);(\s*)toast\.success\((.*)\);/g,
    'const resPost = await api.post($1);$2if(!resPost) return;$2toast.success($3);'
  );

  content = content.replace(
    /await api\.delete\((.*)\);(\s*)toast\.success\((.*)\);/g,
    'const resDel = await api.delete($1);$2if(!resDel) return;$2toast.success($3);'
  );

  if (content !== original) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Updated ${file}`);
    updatedCount++;
  }
});

console.log(`Total files updated: ${updatedCount}`);
