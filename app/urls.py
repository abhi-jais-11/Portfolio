from django.urls import path
from .views import *

app_name = "app"

urlpatterns = [
    path("", home_view, name="home"),
    path("about/", about_view, name="about"),
    path("services/", services_view, name="services"),
    path("pricing/", pricing_view, name="pricing"),
    path("portfolio/", portfolio_view, name="portfolio"),
    path("contact/", contact_view, name="contact"),
]
