import {enterGame} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('publish a social post, congratulate and preserve the record',async({page})=>{
  await enterGame(page);
  const section=page.getByRole('region',{name:'Corporate communications'});
  await section.getByLabel('Communication format').selectOption('social');
  await section.getByRole('button',{name:'Publish communication',exact:true}).click();
  await expect(section.getByTestId('communication-count')).toHaveText('1');
  await section.getByRole('button',{name:'Congratulate',exact:true}).click();
  await expect(section.getByRole('button',{name:'Congratulated',exact:true})).toBeDisabled();
  await section.getByRole('button',{name:'Show comments',exact:true}).click();
  await expect(section.getByText('Congratulations on this strategically significant milestone.')).toBeVisible();
  await page.reload();
  await expect(section.getByTestId('communication-count')).toHaveText('1');
  await expect(section.getByRole('button',{name:'Congratulated',exact:true})).toBeDisabled();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
