import {enterGame,goWorkspace,openSettings} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('resolve an incident and preserve its decision history',async({page})=>{
  await enterGame(page);
 await goWorkspace(page,'incidents');
  const archive=page.getByRole('region',{name:'Incident and decision archive'});
  await expect(archive.getByTestId('incident-catalogue-count')).toHaveText('150');
  await page.getByRole('button',{name:/Conclude working day/}).click();
  const decision=page.getByRole('region',{name:'Pending corporate decision'});
  const title=await decision.getByRole('heading').innerText();
  await decision.getByRole('button').first().click();
  await expect(archive.getByTestId('incident-history-count')).toHaveText('1');
  await expect(archive.getByText(title,{exact:true})).toBeVisible();
  await page.reload();
  await expect(archive.getByTestId('incident-history-count')).toHaveText('1');
  await expect(archive.getByText(title,{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
