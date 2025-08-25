from django.shortcuts import render

# Create your views here.
def home_view(request):
    return render(request,'app/index.html',{})
def about_view(request):
    return render(request,'app/about.html',{})
def services_view(request):
    return render(request,'app/services.html',{})
def pricing_view(request):
    return render(request,'app/pricing.html',{})
def portfolio_view(request):
    return render(request,'app/portfolio.html',{})
def contact_view(request):
    return render(request,'app/contact.html',{})