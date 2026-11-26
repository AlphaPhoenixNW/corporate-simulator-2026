import {test,expect} from '@playwright/test';
test('book a meeting, hold it and preserve its follow-up on reload',async({page})=>{
  await page.goto('/');
  const section=page.getByRole('region',{name:'Meeting governance centre'});
  await section.getByLabel('Meeting type').selectOption('scheduling');
  await section.getByRole('button',{name:'Schedule meeting',exact:true}).click();
  await expect(section.getByTestId('meeting-count')).toHaveText('1');
  await page.getByRole('button',{name:/Conclude working day/}).click();
  await expect(section.getByTestId('meetings-held')).toHaveText('1');
  await expect(section.getByTestId('meeting-count')).toHaveText('1');
  await section.getByRole('button',{name:/Show meeting history/}).click();
  await expect(section.getByText('Forward meeting schedule · record 1')).toBeVisible();
  await page.reload();
  await expect(section.getByTestId('meetings-held')).toHaveText('1');
  await expect(section.getByText('Pre-meeting alignment meeting',{exact:true}).last()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
