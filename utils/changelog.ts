export interface ChangelogEntry {
  version: string
  changes: string[]
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.5.1',
    changes: ['主頁新增「設定」及「更新紀錄」按鈕。']
  },
  {
    version: '1.5.0',
    changes: ['新增表格模板：印象遊戲，可逐一記錄角色的初印象與現在印象。', '下載時自動忽略未填寫的角色，且以每頁六位角色為上限。']
  },
  {
    version: '1.4.0',
    changes: ['新增作品：《鬼滅之刃》']
  },
  {
    version: '1.3.3',
    changes: ['記住每個工具選取的作品與排除角色。', '優化隨機排名的手機版操作與結果排序。']
  },
  {
    version: '1.3.1',
    changes: ['更新排名結果圖片輸出方式。', '可依名次或出場順序檢視、下載隨機排名結果。']
  },
  {
    version: '1.2.0',
    changes: ['新增表格模板：我推年度回顧、It\'s me。', '支援填表人、圖片上傳與更多自訂欄位。']
  }
]
