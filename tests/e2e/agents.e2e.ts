import {enterGame} from '../support/enterGame';
import {test,expect} from '@playwright/test';
test('enable orchestration, execute a workflow and persist its six-role trace',async({page})=>{
  await enterGame(page);
  const os=page.getByRole('region',{name:'NOTHING™ OS Enterprise Edition'});
  await os.getByRole('button',{name:/Activate enterprise licence/}).click();
  const section=page.getByRole('region',{name:'Agentic AI control centre'});
  await section.getByRole('button',{name:'Enable orchestration',exact:true}).click();
  await expect(section.getByTestId('agent-projection')).toHaveText('10,000');
  await page.getByRole('button',{name:/Conclude working day/}).click();
  await expect(section.getByTestId('agent-runs')).toHaveText('1');
  await expect(section.getByTestId('agent-report')).toContainText('Six agents consumed 10000');
  await page.reload();
  await expect(section.getByTestId('agent-runs')).toHaveText('1');
  await expect(section.getByText('Strategic Non-Intervention Agent',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)).toBe(false);
});
