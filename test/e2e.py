import os
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 320, "height": 844})
    page.goto(f"http://127.0.0.1:{os.getenv('PORT', '4173')}")
    page.wait_for_load_state("networkidle")
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    assert page.locator(".product").count() == 3
    page.get_by_role("button", name="Try cereal example").click()
    assert page.locator(".name").nth(0).input_value() == "Family box"
    names = page.locator(".name"); prices = page.locator(".price"); quantities = page.locator(".quantity")
    for i, values in enumerate((("4", "8"), ("5", "500"), ("6", "12"))):
        names.nth(i).fill(f"Product {i + 1}")
        prices.nth(i).fill(values[0]); quantities.nth(i).fill(values[1])
    page.locator(".unit").nth(1).select_option("g")
    page.get_by_role("button", name="Compare prices").click()
    assert page.locator(".winner").count() == 1
    assert "Product 2 is the best deal" in page.locator("#result-summary").inner_text()
    page.locator(".unit").nth(2).select_option("count")
    page.get_by_role("button", name="Compare prices").click()
    assert "Compare like with like" in page.locator("#form-error").inner_text()
    page.get_by_role("button", name="Reset").click()
    page.get_by_role("button", name="Clear all").click()
    page.wait_for_timeout(100)
    assert page.locator(".price").nth(0).input_value() == ""
    browser.close()
