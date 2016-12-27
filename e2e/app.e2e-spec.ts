import { SgfPage } from './app.po';

describe('sgf App', function() {
  let page: SgfPage;

  beforeEach(() => {
    page = new SgfPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
