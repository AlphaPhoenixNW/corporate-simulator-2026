import {enterGame,goWorkspace,openSettings} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('commission a transformation and retain its portfolio record',async({page})=>{
  await enterGame(page);
 await goWorkspace(page,'programmes');
  const section=page.getByRole('region',{name:'Transformation portfolio'});
  await expect(section.getByTestId('programme-count')).toHaveText('0/9');
  await section.getByRole('button',{name:/Commission programme/}).click();
  await expect(section.getByTestId('programme-count')).toHaveText('1/9');
  await expect(section.getByTestId('programme-spend')).toHaveText('£600');
  await page.reload();
  await expect(section.getByTestId('programme-count')).toHaveText('1/9');
  await section.getByRole('button',{name:'Pause programme',exact:true}).click();
  await expect(section.getByRole('button',{name:'Resume programme',exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
